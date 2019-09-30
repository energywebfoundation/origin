import axios from 'axios';
import 'mocha';
import { assert } from 'chai';

import { startAPI } from '../api';

describe('Storage tests', async () => {
    let apiServer: any;

    before(async () => {
        apiServer = await startAPI();
    });

    after(() => {
        apiServer.close();
    });

    it('gets all Origin contracts', async () => {
        const putResult = await axios.put(
            'http://localhost:3030/OriginContractLookupMarketLookupMapping/0xb4ec89404c4a24f4c80d157ba9ad803cbc4db614',
            {
                marketContractLookup: '0x665b25e0edc2d9b5dee75c5f652f92f5b58be12b'
            }
        );
        assert.equal(putResult.status, 200);

        const getResult = await axios.get('http://localhost:3030/OriginContractLookupMarketLookupMapping');
        const expectedResult = {
            '0xb4ec89404c4a24f4c80d157ba9ad803cbc4db614': {
                marketContractLookup: '0x665b25e0edc2d9b5dee75c5f652f92f5b58be12b'
            }
        };
        assert.deepEqual(getResult.data, expectedResult);
    });
});
