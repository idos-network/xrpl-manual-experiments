import { Wallet } from 'xrpl'
import { Client } from "xrpl"
import { config } from '@dotenvx/dotenvx'

config({ path: ['.env.local', '.env'] })

const wallet = Wallet.fromSeed(process.env.XRPL_SEED!)
console.log("Address:", wallet.address)

const client = new Client('wss://s.devnet.rippletest.net:51233/')
await client.connect()

console.log("before", JSON.stringify(await client.request({
    command: 'account_objects',
    account: wallet.address
}), null, 2))

const res = await client.submitAndWait({
    TransactionType: 'CredentialCreate',
    Account: wallet.address,
    Subject: wallet.address,
    CredentialType: Math.random().toString(16).slice(2, 10),
}, {
    wallet: wallet,
})

console.log("Transaction result:", JSON.stringify(res, null, 2))

console.log("after", await client.request({
    command: 'account_objects',
    account: wallet.address
}))

await client.disconnect()
