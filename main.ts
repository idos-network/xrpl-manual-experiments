import { Wallet } from 'xrpl'
import { config } from '@dotenvx/dotenvx'

config({ path: ['.env.local', '.env'] })

const seedWallet = Wallet.fromSeed(process.env.XRPL_SEED!)
console.log("Address:", seedWallet.address)
