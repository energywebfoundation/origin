import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import UserDBJSON from '../../build/contracts/lightweight/UserDB.json';

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

    async getAllLogChangeOwnerEvents(eventFilter?: ISearchLog) {
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

        return this.web3Contract.getPastEvents('LogChangeOwner', eventFilter);
    }

    async getAllEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async setOrganization(_user: string, _organization: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setOrganization(_user, _organization);

        return this.send(method, txParams);
    }

    async setRoles(_user: string, _roles: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setRoles(_user, _roles);

        return this.send(method, txParams);
    }

    async createUser(
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        _user: string,
        _organization: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.createUser(
            _propertiesDocumentHash,
            _documentDBURL,
            _user,
            _organization
        );

        return this.send(method, txParams);
    }

    async setUserActive(_user: string, _active: boolean, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setUserActive(_user, _active);

        return this.send(method, txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async changeOwner(_newOwner: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.changeOwner(_newOwner);

        return this.send(method, txParams);
    }

    async getFullUser(_user: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getFullUser(_user).call(txParams);
    }
}
