import { GeneralFunctions, SpecialTx, SearchLog } from './GeneralFunctions';
import Web3 from 'web3';
import UserDBJSON from '../../build/contracts/UserDB.json';

export class UserDB extends GeneralFunctions {
    web3: Web3;
    buildFile = UserDBJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(UserDBJSON.abi, address)
                : new web3.eth.Contract(
                      UserDBJSON.abi,
                      (UserDBJSON as any).networks.length > 0 ? UserDBJSON.networks[0] : null
                  )
        );
        this.web3 = web3;
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

    async setOrganization(_user: string, _organization: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setOrganization(_user, _organization);

        return await this.send(method, txParams);
    }

    async setRoles(_user: string, _roles: number, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setRoles(_user, _roles);

        return await this.send(method, txParams);
    }

    async createUser(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _user: string,
        _organization: string, 
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.createUser(
            _propertiesDocumentHash,
            _documentDBURL,
            _user,
            _organization
        );

        return await this.send(method, txParams);
    }

    async setUserActive(_user: string, _active: boolean, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.setUserActive(_user, _active);

        return await this.send(method, txParams);
    }

    async owner(txParams?: SpecialTx) {
        return await this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: SpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return await this.send(method, txParams);
    }

    async getFullUser(_user: string, txParams?: SpecialTx) {
        return await this.web3Contract.methods.getFullUser(_user).call(txParams);
    }
}
