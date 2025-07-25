# idOS <3 XRPL; featuring: Oracles!

Spec on Notion: https://www.notion.so/idos-association/idOS-XRPL-integration-proposal-4a7c09f0b9b8470ca12e0db44b832647

XRPL devnet explorer: https://devnet.xrpl.org/

Credential only exist on XRPL's devnet, since the Credentials proposal hasn't been accepted yet.

- All current idOS functionality will work normally for XRPL, because we already support its signer. All XRPL Issuers and Consumers are free to use idOS like everyone else.
- If an Issuer or Consumer is built on XRPL, then they can use this [DepositPreauth](https://xrpl.org/docs/references/protocol/transactions/types/depositpreauth) thing that we tailored our spec to.
- To make this easier, we will offer (probably in a corner of the current SDKs) methods for create and accept XRPL credentials.
    - See [credential_create.ts](credential_create.ts).
- Also part of the grant is this niceness where you can create an AG on idOS by creating a Credential 2 (and the user accepting it, of course).
    - Note that the other way around will be something that we have to support. If an Issuer uses a dWG to create a credential and respective AG, they won't magically show up on XRPL. The Issuer still have to create Credential 1 (for the original) and Credential 2 (for its AG).
        - Note how this makes it really hard for the Issuer to set the timelock right in the XRPL Credential 2. See notes on [subscribe.ts](subscribe.ts).
- To make this work, we will have a Kwil Oracle that detects their creation in XRPL and does the equivalent AG creation (assuming the credential copy exists, etc).
    - See [subscribe.ts](subscribe.ts).
- Make sure to create an XRPL Credential usage guide, having the issuer and consumer guides be required reading, and how to use the above and the DepositPreauth.

Boom, wallet connected. 🚀
