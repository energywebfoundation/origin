import { Configuration } from '@energyweb/utils-general';
import { assert } from 'chai';
import * as Demand from '../blockchain-facade/Demand';

describe('Demand tests', () => {
    const testDemands = [
        {
            _propertiesDocumentHash: 'hash1',
            _documentDBURL: 'url1',
            _status: Demand.DemandStatus.ACTIVE
        },
        {
            _propertiesDocumentHash: 'hash2',
            _documentDBURL: 'url2',
            _status: Demand.DemandStatus.ACTIVE
        },
        {
            _propertiesDocumentHash: 'hash3',
            _documentDBURL: 'url3',
            _status: Demand.DemandStatus.ARCHIVED
        }
    ];

    it('should return demand with given status', async () => {
        const config = {
            blockchainProperties: {
                marketLogicInstance: {
                    getAllDemandListLength: () => testDemands.length,
                    getDemand: async (id: string) => testDemands[parseInt(id, 10)]
                }
            }
        } as Configuration.Entity;

        const activeDemands = await Demand.filterDemandBy(config, {
            status: Demand.DemandStatus.ACTIVE
        });

        assert.equal(activeDemands.length, 2);

        const archivedDemands = await Demand.filterDemandBy(config, {
            status: Demand.DemandStatus.ARCHIVED
        });

        assert.equal(archivedDemands.length, 1);
    });
});
