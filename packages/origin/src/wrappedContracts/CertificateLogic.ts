import { SpecialTx, SearchLog, getClientVersion } from './GeneralFunctions';
import Web3 from 'web3';
import CertificateLogicJSON from '../../build/contracts/lightweight/CertificateLogic.json';
import { CertificateSpecificContract } from './CertificateSpecificContract';

export class CertificateLogic extends CertificateSpecificContract {
    web3: Web3;
    buildFile = CertificateLogicJSON;

    constructor(web3: Web3, address?: string) {
        super(web3, address);
        this.web3Contract = address
            ? new web3.eth.Contract(CertificateLogicJSON.abi, address)
            : new web3.eth.Contract(
                  CertificateLogicJSON.abi,
                  (CertificateLogicJSON as any).networks.length > 0
                      ? CertificateLogicJSON.networks[0]
                      : null
              );
    }

    async getAllLogCreatedCertificateEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogCreatedCertificate', filterParams);
    }

    async getAllLogCertificateRetiredEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogCertificateRetired', filterParams);
    }

    async getAllLogCertificateSplitEvents(eventFilter?: SearchLog) {
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

        return await this.web3Contract.getPastEvents('LogCertificateSplit', filterParams);
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

    async update(_newLogic: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.update(_newLogic);

        return await this.send(method, txParams);
    }

    async transferFrom(_from: string, _to: string, _entityId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.transferFrom(_from, _to, _entityId);

        return await this.send(method, txParams);
    }

    async splitCertificate(_certificateId: number, _power: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.splitCertificate(_certificateId, _power);

        return await this.send(method, txParams);
    }

    async splitAndPublishForSale(
        _certificateId: number,
        _energy: number,
        _price: number,
        _tokenAddress: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.splitAndPublishForSale(
            _certificateId,
            _energy,
            _price,
            _tokenAddress
        );

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

    async getCertificate(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getCertificate(_certificateId).call(txParams);
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

    async getCertificateOwner(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getCertificateOwner(_certificateId).call(txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async splitAndBuyCertificate(_certificateId: number, _power: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.splitAndBuyCertificate(_certificateId, _power);

        return await this.send(method, txParams);
    }

    async buyCertificate(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.buyCertificate(_certificateId);

        return await this.send(method, txParams);
    }

    async buyCertificateBulk(_idArray: number[], txParams?: SpecialTx) {
        const method = this.web3Contract.methods.buyCertificateBulk(_idArray);

        return await this.send(method, txParams);
    }

    async setApprovalForAll(_escrow: string, _approved: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setApprovalForAll(_escrow, _approved);

        return await this.send(method, txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async getCertificateListLength(txParams?: SpecialTx) {
        return await this.web3Contract.methods.getCertificateListLength().call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async removeEscrow(_certificateId: number, _escrow: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.removeEscrow(_certificateId, _escrow);

        return await this.send(method, txParams);
    }

    async publishForSale(
        _certificateId: number,
        _price: number,
        _tokenAddress: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.publishForSale(
            _certificateId,
            _price,
            _tokenAddress
        );

        return await this.send(method, txParams);
    }

    async unpublishForSale(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.unpublishForSale(_certificateId);

        return await this.send(method, txParams);
    }

    async isRetired(_certificateId: number, txParams?: SpecialTx) {
        return await this.web3Contract.methods.isRetired(_certificateId).call(txParams);
    }

    async retireCertificate(_certificateId: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.retireCertificate(_certificateId);

        return await this.send(method, txParams);
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
