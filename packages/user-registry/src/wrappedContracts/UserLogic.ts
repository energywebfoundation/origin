import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx, ISearchLog } from '@energyweb/utils-general';
import UserLogicJSON from '../../build/contracts/lightweight/UserLogic.json';

export class UserLogic extends GeneralFunctions {
    web3: Web3;

    constructor(web3: Web3, address?: string) {
        const buildFile: any = UserLogicJSON;
        super(
            address
                ? new web3.eth.Contract(buildFile.abi, address)
                : new web3.eth.Contract(
                      buildFile.abi,
                      buildFile.networks.length > 0 ? buildFile.networks[0] : null
                  )
        );
        this.web3 = web3;
    }

    async getAllEvents(eventFilter?: ISearchLog) {
        return this.web3Contract.getPastEvents('allEvents', eventFilter);
    }

    async initialize(txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.initialize();

        return this.send(method, txParams);
    }

    async deactivateUser(_user: string, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.deactivateUser(_user);

        return this.send(method, txParams);
    }

    async getRolesRights(_user: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getRolesRights(_user).call(txParams);
    }

    async setRoles(_user: string, _rights: number, txParams?: ISpecialTx) {
        const method = this.web3Contract.methods.setRoles(_user, _rights);

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

    async updateUser(
        _user: string,
        _propertiesDocumentHash: string,
        _documentDBURL: string,
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.updateUser(
            _user,
            _propertiesDocumentHash,
            _documentDBURL
        );

        return this.send(method, txParams);
    }

    async owner(txParams?: ISpecialTx) {
        return this.web3Contract.methods.owner().call(txParams);
    }

    async isRole(_role: number, _caller: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.isRole(_role, _caller).call(txParams);
    }

    async getFullUser(_user: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.getFullUser(_user).call(txParams);
    }

    async doesUserExist(_user: string, txParams?: ISpecialTx) {
        return this.web3Contract.methods.doesUserExist(_user).call(txParams);
    }
}
