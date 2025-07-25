import { Wallet , Client, decodeAccountID } from "xrpl"
import { config } from '@dotenvx/dotenvx'
import * as Utf8 from "@stablelib/utf8"
import * as Hex from "@stablelib/hex"

config({ path: ['.env.local', '.env'] })

const client = new Client('wss://s.devnet.rippletest.net:51233/')
await client.connect()

function getWalletAndLog(seed: string, label: string) {
    const wallet = Wallet.fromSeed(seed)
    console.log(`${label} address:`, wallet.address)
    console.log(`${label} AccountID (hex):`, Hex.encode(decodeAccountID(wallet.address)))
    return wallet
}

const userWallet = getWalletAndLog(process.env.XRPL_USER_SEED!, "User")
const issuerWallet = getWalletAndLog(process.env.XRPL_ISSUER_SEED!, "Issuer")
const consumerWallet = getWalletAndLog(process.env.XRPL_CONSUMER_SEED!, "Consumer")

// ------------------------------------------------------------------------------------------------

const credential1Type = 'KYC'

console.log("")
console.log("Creating Credential 1")
const resCredential1Create = await client.submitAndWait({
    TransactionType: 'CredentialCreate',
    Account: issuerWallet.address,
    Subject: userWallet.address,
    CredentialType: Hex.encode(Utf8.encode(credential1Type)),
}, {
    wallet: issuerWallet,
})
console.log("Result:", JSON.stringify(resCredential1Create, null, 2))

console.log("")
console.log("Accepting Credential 1")
const resCredential1Accept = await client.submitAndWait({
    TransactionType: 'CredentialAccept',
    Issuer: issuerWallet.address,
    Account: userWallet.address,
    CredentialType: Hex.encode(Utf8.encode(credential1Type)),
}, {
    wallet: userWallet,
})
console.log("Result:", JSON.stringify(resCredential1Accept, null, 2))

// ------------------------------------------------------------------------------------------------

// Careful with byte shenanigans here. If you get confused, don't try to guess it too much, just grab pkoch.
const credential2Type = Buffer.concat([
    Utf8.encode('AG'),
    Utf8.encode('-'),
    Utf8.encode(credential1Type),
    Utf8.encode('-'),
    decodeAccountID(issuerWallet.address),
    Utf8.encode('-'),
    Utf8.encode('5Y'),
])


console.log("")
console.log("Creating Credential 2")
const resCredential2Create = await client.submitAndWait({
    TransactionType: 'CredentialCreate',
    Account: consumerWallet.address,
    Subject: userWallet.address,
    CredentialType: Hex.encode(credential2Type),
}, {
    wallet: consumerWallet,
})
console.log("Result:", JSON.stringify(resCredential2Create, null, 2))

console.log("")
console.log("Accepting Credential 2")
const resCredential2Accept = await client.submitAndWait({
    TransactionType: 'CredentialAccept',
    Issuer: consumerWallet.address,
    Account: userWallet.address,
    CredentialType: Hex.encode(credential2Type),
}, {
    wallet: userWallet,
})
console.log("Result:", JSON.stringify(resCredential2Accept, null, 2))

// ------------------------------------------------------------------------------------------------

console.log("")
console.log("Resulting account objects:", JSON.stringify(await client.request({
    command: 'account_objects',
    account: userWallet.address
}), null, 2))

await client.disconnect()
