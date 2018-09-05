export namespace TestAccounts {

    const Web3 = require('web3')
    const web3 = new Web3('http://localhost:8545')

    export const topAdminPK = "d9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5"
    export const topAdmin = web3.eth.accounts.privateKeyToAccount('0x' + topAdminPK).address;

    export const userAdminPK = "191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c"
    export const userAdmin = web3.eth.accounts.privateKeyToAccount('0x' + userAdminPK).address;

    export const assetAdminPK = "968cc146af9c9d3ac08cca0dd3f915ed5a0966c118e26fd5e99066b0ff8bc060"
    export const assetAdmin = web3.eth.accounts.privateKeyToAccount('0x' + assetAdminPK).address;

    export const agreementAdminPK = "094eaa66c712a1a308b2bd1189cc200613d856b399d502c1e68f25649970a5b0"
    export const agreementAdmin = web3.eth.accounts.privateKeyToAccount('0x' + agreementAdminPK).address;

    export const assetManagerPK = "554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed"
    export const assetManager = web3.eth.accounts.privateKeyToAccount('0x' + assetManagerPK).address;

    export const traderPK = "7da67da863672d4cc2984e93ce28d98b0d782d8caa43cd1c977b919c0209541b"
    export const trader = web3.eth.accounts.privateKeyToAccount('0x' + traderPK).address;

    export const smartMeterPK = "9ed06d258a8b6d323b59c5bf8b84876c5bb2ba25af275cfff013eb630aac2bad"
    export const smartMeter = web3.eth.accounts.privateKeyToAccount('0x' + smartMeterPK).address;

    export const matcherPK = "9ed06d258a8b6d323b59c5bf8b84876c5bb2ba25af275cfff013eb630aac2bad"
    export const matcher = web3.eth.accounts.privateKeyToAccount('0x' + matcherPK).address;

    export const user1PK = "9ed06d258a8b6d323b59c5bf8b84876c5bb2ba25af275cfff013eb630aac2bad"
    export const user1 = web3.eth.accounts.privateKeyToAccount('0x' + user1PK).address;

    export const user2PK = "9ed06d258a8b6d323b59c5bf8b84876c5bb2ba25af275cfff013eb630aac2bad"
    export const user2 = web3.eth.accounts.privateKeyToAccount('0x' + user2PK).address;

    export const parityStandardPK = "4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
    export const parityStandard = web3.eth.accounts.privateKeyToAccount('0x' + parityStandardPK).address;

    export const wallet = web3.eth.accounts.wallet
    wallet.add('0x' + topAdminPK);
    wallet.add('0x' + userAdminPK)
    wallet.add('0x' + assetAdminPK)
    wallet.add('0x' + agreementAdminPK)
    wallet.add('0x' + assetManagerPK)
    wallet.add('0x' + traderPK)
    wallet.add('0x' + smartMeterPK)
    wallet.add('0x' + matcherPK)
    wallet.add('0x' + user1PK)
    wallet.add('0x' + user2PK)
    wallet.add('0x' + parityStandardPK)


}