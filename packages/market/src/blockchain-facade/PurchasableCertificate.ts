// import { TransactionReceipt, EventLog } from 'web3/types';
// import { Currency, Configuration } from '@energyweb/utils-general';
// import { Certificate } from '@energyweb/origin';

// export interface IPurchasableCertificate extends Certificate.ICertificate {
//     forSale: boolean;
//     isOffChainSettlement: true;

//     price: number;
//     currency: Currency;
// }

// export class Entity extends Certificate.Entity implements IPurchasableCertificate {
//     forSale: boolean;

//     isOffChainSettlement: true;

//     price: number;

//     currency: Currency;

//     getUrl(): string {
//         const marketLogicAddress = this.configuration.blockchainProperties.marketLogicInstance
//             .web3Contract.options.address;

//         return `${this.configuration.offChainDataSource.baseUrl}/PurchasableCertificate/${marketLogicAddress}`;
//     }

//     async sync(): Promise<Entity> {
//         if (this.id != null) {
//             const cert = await this.configuration.blockchainProperties.certificateLogicInstance.getCertificate(
//                 this.id
//             );

//             this.assetId = cert.tradableEntity.assetId;
//             this.owner = cert.tradableEntity.owner;
//             this.energy = Number(cert.tradableEntity.energy);
//             this.approvedAddress = cert.tradableEntity.approvedAddress;

//             this.children = cert.certificateSpecific.children;
//             this.status = cert.certificateSpecific.status;
//             this.dataLog = cert.certificateSpecific.dataLog;
//             this.creationTime = cert.certificateSpecific.creationTime;
//             this.parentId = cert.certificateSpecific.parentId;
//             this.maxOwnerChanges = cert.certificateSpecific.maxOwnerChanges;
//             this.ownerChangerCounter = cert.certificateSpecific.ownerChangeCounter;

//             this.initialized = true;

//             if (this.configuration.logger) {
//                 this.configuration.logger.verbose(`Certificate ${this.id} synced`);
//             }
//         }

//         return this;
//     }

//     async retireCertificate(): Promise<TransactionReceipt> {
//         if (this.configuration.blockchainProperties.activeUser.privateKey) {
//             return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
//                 this.id,
//                 { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
//             );
//         }
//         return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
//             this.id,
//             { from: this.configuration.blockchainProperties.activeUser.address }
//         );
//     }

//     async splitCertificate(energy: number): Promise<TransactionReceipt> {
//         if (this.configuration.blockchainProperties.activeUser.privateKey) {
//             return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
//                 this.id,
//                 energy,
//                 { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
//             );
//         }
//         return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
//             this.id,
//             energy,
//             { from: this.configuration.blockchainProperties.activeUser.address }
//         );
//     }

//     async getCertificateOwner(): Promise<string> {
//         return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(
//             this.id
//         );
//     }

//     async isRetired(): Promise<boolean> {
//         return this.configuration.blockchainProperties.certificateLogicInstance.isRetired(this.id);
//     }

//     async claim() {
//         const accountProperties = {
//             from: this.configuration.blockchainProperties.activeUser.address,
//             privateKey: this.configuration.blockchainProperties.activeUser.privateKey
//         };

//         return this.configuration.blockchainProperties.certificateLogicInstance.retireCertificate(
//             parseInt(this.id, 10),
//             accountProperties
//         );
//     }

//     async getAllCertificateEvents(): Promise<EventLog[]> {
//         const allEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
//             {
//                 topics: [
//                     null,
//                     this.configuration.blockchainProperties.web3.utils.padLeft(
//                         this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
//                         64,
//                         '0'
//                     )
//                 ],
//                 fromBlock: 0
//             }
//         );

//         const returnEvents = [];

//         for (const fullEvent of allEvents) {
//             // we have to remove some false positives due to ERC721 interface
//             if (fullEvent.event === 'Transfer') {
//                 if (fullEvent.returnValues._tokenId === `${this.id}`) {
//                     returnEvents.push(fullEvent);
//                 }
//             } else {
//                 returnEvents.push(fullEvent);
//             }
//         }

//         // we also have to search
//         if (this.id !== '0') {
//             const transferEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
//                 {
//                     topics: [
//                         '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//                         null,
//                         null,
//                         this.configuration.blockchainProperties.web3.utils.padLeft(
//                             this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
//                             64,
//                             '0'
//                         )
//                     ],
//                     fromBlock: 0
//                 }
//             );

//             for (const transferEvent of transferEvents) {
//                 returnEvents.push(transferEvent);
//             }
//         }

//         return returnEvents;
//     }
// }
