import { Wallet } from 'xrpl'
import { Client } from "xrpl"
import { config } from '@dotenvx/dotenvx'

config({ path: ['.env.local', '.env'] })

const wallet = Wallet.fromSeed(process.env.XRPL_SEED!)
console.log("Address:", wallet.address)

const client = new Client('wss://s.altnet.rippletest.net:51233')
await client.connect()
console.log(await client.getBalances(wallet.address))
