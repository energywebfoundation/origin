import Web3 from 'web3';
import { GeneralFunctions, ISpecialTx } from '@energyweb/utils-general';
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
        txParams?: ISpecialTx
    ) {
        const method = this.web3Contract.methods.onERC721Received(
            _operator,
            _from,
            _tokenId,
            _data
        );

        return this.send(method, txParams);
    }

    async safeTransferFrom(_from, _to, _entityId, _data?, txParams?: ISpecialTx) {
        if (_data) {
            const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId, _data);

            return this.send(method, txParams);
        }
        const method = this.web3Contract.methods.safeTransferFrom(_from, _to, _entityId);

        return this.send(method, txParams);
    }

    async entityContract(txParams?: ISpecialTx) {
        return this.web3Contract.methods.entityContract().call(txParams);
    }
}
