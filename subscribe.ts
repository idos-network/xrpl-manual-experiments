import xrpl from 'xrpl'
import { config } from '@dotenvx/dotenvx'
import * as Utf8 from "@stablelib/utf8"
import * as Hex from "@stablelib/hex"

config({ path: ['.env.local', '.env'] })

const client = new xrpl.Client('wss://s.devnet.rippletest.net:51233/')
await client.connect()

const create_access_grant = (params: {}) => void(0) // This would be create_access_grant in the Kwil schema, or equivalent.

client.on('transaction', async (tx: xrpl.TransactionStream) => {
    const tx_json = tx.tx_json;
    if (!tx_json) {
        // console.error("Transaction data is missing:", JSON.stringify(tx, null, 2));
        return;
    }

    if (tx_json.TransactionType !== "CredentialAccept") {
        // console.log("Not a wanted transaction type:", tx_json.TransactionType);
        return;
    }

    const credentialAtoms = tx_json.CredentialType.split(Hex.encode(Utf8.encode('-')));

    if(credentialAtoms[0] !== Hex.encode(Utf8.encode('AG'))) {
        // console.log("Credential type does not start with 'AG':", credentialAtoms[0]);
        return;
    }

    const objs = await client.request({
        command: 'account_objects',
        account: tx_json.Account
    })

    const candidates = objs.result.account_objects.filter(obj =>
        obj.LedgerEntryType === 'Credential'
        && obj.Subject === tx_json.Account
        && obj.CredentialType === credentialAtoms[1]
        && obj.Issuer === xrpl.encodeAccountID(Hex.decode(credentialAtoms[2]))
    )
    if(candidates.length === 0) {
        // console.error("No matching credential found for transaction:", JSON.stringify(tx_json, null, 2));
        return;
    }

    // Get the sibling credential. Use the same trick as we did for passporting.
    // If we can't find it, we just ignore the transaction.
    const credential_copy_id = undefined; // Sibling id

    // For locked_until, we have two options:
    // 1. Change the current spec for the last atom to be a packed uint32, which is the locked_until timestamp.
    // 2. Use the current ledger time, which is tx_json.date, and add what the last atom represents.
    // If we go for option 2, we can't support AG lock extension, since the consumer will have a really hard time aligning the block time + duration to be the same as the AG already on idOS.
    const locked_until = undefined;

    create_access_grant({
        grantee_wallet_identifier: tx_json.Account,
        data_id: credential_copy_id,
        locked_until,
        content_hash: null, // No passporting here, so no content hash.
    })
})

await client.request({
    command: 'subscribe',
    streams: ['transactions'],
})

// Hang forever. Ctrl+C to stop.
