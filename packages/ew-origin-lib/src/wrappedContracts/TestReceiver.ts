import { GeneralFunctions, SpecialTx, getClientVersion } from './GeneralFunctions';
import Web3 = require('web3');
import TestReceiverJSON from '../../build/contracts/TestReceiver.json';

export class TestReceiver extends GeneralFunctions {
    web3: Web3;
    buildFile = TestReceiverJSON;

    constructor(web3: Web3, address?: string) {
        super(
            address
                ? new web3.eth.Contract(TestReceiverJSON.abi, address)
                : new web3.eth.Contract(
                      TestReceiverJSON.abi,
                      (TestReceiverJSON as any).networks.length > 0
                          ? TestReceiverJSON.networks[0]
                          : null
                  )
        );
        this.web3 = web3;
    }

    async onERC721Received(
        _operator: string,
        _from: string,
        _tokenId: number,
        _data: string,
        txParams?: SpecialTx
    ) {
        const method = this.web3Contract.methods.onERC721Received(_operator, _from, _tokenId, _data);
        const transactionParams = await this.buildTransactionParams(method, txParams);
            
        return await this.send(method, transactionParams);
    }

    async safeTransferFrom(_from, _to, _entityId, _data?, txParams?: SpecialTx) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId, _data);
            const transactionParams = await this.buildTransactionParams(method, txParams);
                
            return await this.send(method, transactionParams);
        } else {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId)
            const transactionParams = await this.buildTransactionParams(method, txParams);
                
            return await this.send(method, transactionParams);
        }
    }

    async entityContract(txParams?: SpecialTx) {
        return await this.web3Contract.methods.entityContract().call(txParams);
    }
}
