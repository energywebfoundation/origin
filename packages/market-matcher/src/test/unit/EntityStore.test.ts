import 'reflect-metadata';
import { Substitute, Arg } from '@fluffy-spoon/substitute';
import * as Winston from 'winston';
import { assert } from 'chai';

import { Configuration } from '@energyweb/utils-general';
import { Demand } from '@energyweb/market';
import { EntityStore } from '../../EntityStore';
import { IEntityFetcher } from '../../EntityFetcher';

describe('EntityStore', () => {
    function setupDemand(id: string, automaticMatching: boolean, isFulfilled: boolean) {
        const demand = Substitute.for<Demand.Entity>();
        const offChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();

        offChainProperties.automaticMatching.returns(automaticMatching);
        demand.offChainProperties.returns(offChainProperties);

        demand.id.returns(id);
        demand.isFulfilled().returns(Promise.resolve(isFulfilled));

        return demand;
    }

    function setupFetcher(demand: Demand.Entity) {
        const fetcher = Substitute.for<IEntityFetcher>();

        fetcher.getAgreementListLength().returns(Promise.resolve(0));
        fetcher.getSupplyListLength().returns(Promise.resolve(0));
        fetcher.getCertificateListLength().returns(Promise.resolve(0));
        fetcher.getDemandListLength().returns(Promise.resolve(1));
        fetcher.getDemand(Arg.all()).returns(Promise.resolve(demand));

        return fetcher;
    }

    it('should skip demand that has automaticMatching set to false', async () => {
        const demand = setupDemand('1', false, false);

        const config = Substitute.for<Configuration.Entity>();
        const logger = Substitute.for<Winston.Logger>();
        const fetcher = setupFetcher(demand);

        const entityStore = new EntityStore(config, logger, fetcher);

        assert.deepEqual(entityStore.getDemands(), []);

        await entityStore.init(false);

        assert.deepEqual(entityStore.getDemands(), []);
    });

    it('should include demand that has automaticMatching set to true', async () => {
        const demand = setupDemand('1', true, false);

        const config = Substitute.for<Configuration.Entity>();
        const logger = Substitute.for<Winston.Logger>();
        const fetcher = setupFetcher(demand);

        const entityStore = new EntityStore(config, logger, fetcher);

        assert.deepEqual(entityStore.getDemands(), []);

        await entityStore.init(false);

        assert.deepEqual(entityStore.getDemands(), [demand]);
    });

    it('should skip demand that is fulfilled', async () => {
        const demand = setupDemand('1', true, true);

        const config = Substitute.for<Configuration.Entity>();
        const logger = Substitute.for<Winston.Logger>();
        const fetcher = setupFetcher(demand);

        const entityStore = new EntityStore(config, logger, fetcher);

        assert.deepEqual(entityStore.getDemands(), []);

        await entityStore.init(false);

        assert.deepEqual(entityStore.getDemands(), []);
    });
});
