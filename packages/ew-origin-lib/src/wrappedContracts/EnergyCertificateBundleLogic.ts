import { SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 = require('web3');

import EnergyCertificateBundleLogicJSON from '../../build/contracts/EnergyCertificateBundleLogic.json';
import { CertificateSpecificContract } from './CertificateSpecificContract';

export class EnergyCertificateBundleLogic extends CertificateSpecificContract {
    web3: Web3;
    buildFile = EnergyCertificateBundleLogicJSON;

    constructor(web3: Web3, address?: string) {
        super(web3, address);
        
        this.web3Contract = address
        ? new web3.eth.Contract(EnergyCertificateBundleLogicJSON.abi, address)
        : new web3.eth.Contract(
              EnergyCertificateBundleLogicJSON.abi,
              (EnergyCertificateBundleLogicJSON as any).networks.length > 0
                  ? EnergyCertificateBundleLogicJSON.networks[0]
                  : null
          )
        this.web3 = web3;
    }

    async getAllLogCreatedBundleEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogCreatedBundle', filterParams);
    }

    async getAllLogBundleRetiredEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogBundleRetired', filterParams);
    }

    async getAllLogBundleOwnerChangedEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogBundleOwnerChanged', filterParams);
    }

    async getAllLogEscrowRemovedEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogEscrowRemoved', filterParams);
    }

    async getAllLogEscrowAddedEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogEscrowAdded', filterParams);
    }

    async getAllTransferEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('Transfer', filterParams);
    }

    async getAllApprovalEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('Approval', filterParams);
    }

    async getAllApprovalForAllEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('ApprovalForAll', filterParams);
    }

    async getAllLogChangeOwnerEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest'
            };
            if (eventFilter.topics) {
                filterParams.topics = eventFilter.topics;
            }
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest'
            };
        }

        return await this.web3Contract.getPastEvents('LogChangeOwner', filterParams);
    }

    async getAllEvents(eventFilter?: SearchLog) {
        let filterParams;
        if (eventFilter) {
            filterParams = {
                fromBlock: eventFilter.fromBlock ? eventFilter.fromBlock : 0,
                toBlock: eventFilter.toBlock ? eventFilter.toBlock : 'latest',
                topics: eventFilter.topics ? eventFilter.topics : [null]
            };
        } else {
            filterParams = {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null]
            };
        }

        return await this.web3Contract.getPastEvents('allEvents', filterParams);
    }

    async supportsInterface(_interfaceID: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.supportsInterface(_interfaceID).call(txParams);
    }

    async getApproved(_tokenId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getApproved(_tokenId).call(txParams);
    }

    async approve(_approved: string, _entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.approve(_approved, _entityId);

        return await this.send(method, txParams);
    }

    async addEscrowForEntity(_certificateId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addEscrowForEntity(_certificateId, _escrow);

        return await this.send(method, txParams);
    }

    async getBundleListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundleListLength().call(txParams);
    }

    async update(_newLogic: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return await this.send(method, txParams);
    }

    async addEscrowForAsset(_bundleId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.addEscrowForAsset(_bundleId, _escrow);

        return await this.send(method, txParams);
    }

    async transferFrom(_from: string, _to: string, _entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _entityId);

        return await this.send(method, txParams);
    }

    async getBundle(_bundleId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundle(_bundleId).call(txParams);
    }

    async createTradableEntity(_assetId: number, _powerInW: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.createTradableEntity(_assetId, _powerInW);

        return await this.send(method, txParams);
    }

    async safeTransferFrom(_from, _to, _entityId, _data?, txParams?: SpecialTx) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId, _data);

            return await this.send(method, txParams);
        } else {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId);

            return await this.send(method, txParams);
        }
    }

    async userContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.userContractLookup().call(txParams);
    }

    async db(txParams?: SpecialTx) {
        return await this.web3Contract.methods.db().call(txParams);
    }

    async setOnChainDirectPurchasePrice(_entityId: number, _price: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setOnChainDirectPurchasePrice(_entityId, _price);

        return await this.send(method, txParams);
    }

    async ownerOf(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.ownerOf(_entityId).call(txParams);
    }

    async assetContractLookup(txParams?: SpecialTx) {
        return await this.web3Contract.methods.assetContractLookup().call(txParams);
    }

    async checkMatcher(_matcher: string[], txParams?: SpecialTx) {
        return await this.web3Contract.methods.checkMatcher(_matcher).call(txParams);
    }

    async balanceOf(_owner: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.balanceOf(_owner).call(txParams);
    }

    async getTradableEntity(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableEntity(_entityId).call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async getBundleOwner(_bundleId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getBundleOwner(_bundleId).call(txParams);
    }

    async setApprovalForAll(_escrow: string, _approved: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setApprovalForAll(_escrow, _approved);

        return await this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async retireBundle(_bundleId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.retireBundle(_bundleId);

        return await this.send(method, txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async removeEscrow(_bundleId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeEscrow(_bundleId, _escrow);

        return await this.send(method, txParams);
    }

    async publishForSale(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.publishForSale(_certificateId);

        return await this.send(method, txParams);
    }

    async unpublishForSale(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.unpublishForSale(_certificateId);

        return await this.send(method, txParams);
    }

    async isRetired(_bundleId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRetired(_bundleId).call(txParams);
    }

    async setTradableToken(_entityId: number, _tokenContract: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setTradableToken(_entityId, _tokenContract);

        return await this.send(method, txParams);
    }

    async getOnChainDirectPurchasePrice(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods
            .getOnChainDirectPurchasePrice(_entityId)
            .call(txParams);
    }

    async isApprovedForAll(_owner: string, _operator: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isApprovedForAll(_owner, _operator).call(txParams);
    }

    async init(_database: string, _admin: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.init(_database, _admin);

        return await this.send(method, txParams);
    }

    async getTradableToken(_entityId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getTradableToken(_entityId).call(txParams);
    }
}
