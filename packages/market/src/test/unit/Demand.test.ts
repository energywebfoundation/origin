import { Configuration, TimeFrame } from '@energyweb/utils-general';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';
import moment from 'moment';
import Web3 from 'web3';

import Eth from 'web3/eth'; // eslint-disable-line import/no-unresolved
import { Block } from 'web3/eth/types'; // eslint-disable-line import/no-unresolved
import { EventLog } from 'web3/types'; // eslint-disable-line import/no-unresolved

import {
    calculateMissingEnergyDemand,
    IDemand,
    IDemandOffChainProperties
} from '../../blockchain-facade/Demand';
import { MarketLogic } from '../../wrappedContracts/MarketLogic';

type FilledEvent = { blockNumber: number; value: number };

describe('Demand unit tests', () => {
    describe('Demand time-series calculations', () => {
        const createConfig = (blockTimeStamps: number[], filledEvents: FilledEvent[]) => {
            const blocks = blockTimeStamps.map((timeStamp, index) => {
                const block = Substitute.for<Block>();
                block.timestamp.returns(timeStamp);
                block.number.returns(index + 1);

                return block;
            });

            const events = filledEvents.map(event => {
                const filledEvent = Substitute.for<EventLog>();
                filledEvent.returnValues.returns({ _amount: event.value });
                filledEvent.blockNumber.returns(event.blockNumber);

                return filledEvent;
            });

            const eth = Substitute.for<Eth>();
            blocks.forEach(block => eth.getBlock(block.number).returns(Promise.resolve(block)));

            const web3 = Substitute.for<Web3>();
            web3.eth.returns(eth);

            const marketLogic = Substitute.for<MarketLogic>();
            marketLogic.getEvents(Arg.all()).returns(Promise.resolve(events));

            const blockChainProperties = Substitute.for<Configuration.BlockchainProperties>();
            blockChainProperties.marketLogicInstance.returns(marketLogic);
            blockChainProperties.web3.returns(web3);

            const config = Substitute.for<Configuration.Entity>();
            config.blockchainProperties.returns(blockChainProperties);

            return config;
        };

        const createDemand = (
            start: moment.Moment,
            end: moment.Moment,
            timeFrame: TimeFrame,
            energyPerTimeFrame: number
        ) => {
            const demand = Substitute.for<IDemand>();
            const offChainProperties = Substitute.for<IDemandOffChainProperties>();

            offChainProperties.startTime.returns(start.toISOString());
            offChainProperties.endTime.returns(end.toISOString());
            offChainProperties.timeFrame.returns(timeFrame);
            offChainProperties.energyPerTimeFrame.returns(energyPerTimeFrame);

            demand.offChainProperties.returns(offChainProperties);

            return demand;
        };

        it('should return demand time-series if there is no filled events', async () => {
            const deliveries = 2;

            const start = moment().startOf('day');
            const end = start.clone().add(deliveries, 'day');
            const energyPerTimeFrame = 1000;

            const config = createConfig([], []);
            const demand = createDemand(start, end, TimeFrame.daily, energyPerTimeFrame);

            const missingEnergy = await calculateMissingEnergyDemand(demand, config);

            assert.equal(missingEnergy.length, deliveries);
            assert.isTrue(missingEnergy.every(item => item.value === energyPerTimeFrame));
        });

        it('should return demand time-series respecting filled events', async () => {
            const deliveries = 4;

            const start = moment().startOf('day');
            const end = start.clone().add(deliveries, 'day');
            const energyPerTimeFrame = 1000;

            const fillAmount = 200;

            const blockOne = start.unix();
            const blockTwo = start
                .clone()
                .add(2, 'day')
                .unix();

            const blockOneEvent = { blockNumber: 1, value: fillAmount };
            const blockTwoEvent = { blockNumber: 2, value: fillAmount };

            const config = createConfig([blockOne, blockTwo], [blockOneEvent, blockTwoEvent]);
            const demand = createDemand(start, end, TimeFrame.daily, energyPerTimeFrame);

            const missingEnergy = await calculateMissingEnergyDemand(demand, config);

            assert.equal(missingEnergy.length, deliveries);
            assert.equal(missingEnergy[0].value, energyPerTimeFrame - fillAmount);
            assert.equal(missingEnergy[1].value, energyPerTimeFrame);
            assert.equal(missingEnergy[2].value, energyPerTimeFrame - fillAmount);
            assert.equal(missingEnergy[3].value, energyPerTimeFrame);
        });

        it('should return demand time-series respecting filled events in the same block', async () => {
            const deliveries = 3;

            const start = moment().startOf('day');
            const end = start.clone().add(deliveries, 'day');
            const energyPerTimeFrame = 1000;

            const fillAmount = 200;

            const blockOne = start.unix();
            const blockTwo = start
                .clone()
                .add(2, 'day')
                .unix();

            const blockOneEvent = { blockNumber: 1, value: fillAmount };
            const blockTwoEventOne = { blockNumber: 2, value: fillAmount };
            const blockTwoEventTwo = { blockNumber: 2, value: fillAmount * 2 };

            const config = createConfig(
                [blockOne, blockTwo],
                [blockOneEvent, blockTwoEventOne, blockTwoEventTwo]
            );
            const demand = createDemand(start, end, TimeFrame.daily, energyPerTimeFrame);

            const missingEnergy = await calculateMissingEnergyDemand(demand, config);

            assert.equal(missingEnergy.length, deliveries);
            assert.equal(missingEnergy[0].value, energyPerTimeFrame - fillAmount);
            assert.equal(missingEnergy[1].value, energyPerTimeFrame);
            assert.equal(missingEnergy[2].value, energyPerTimeFrame - fillAmount * 3);
        });

        it('should return demand time-series respecting filled events and ignoring filled events out of range', async () => {
            const deliveries = 3;

            const start = moment().startOf('day');
            const end = start.clone().add(deliveries, 'day');
            const energyPerTimeFrame = 1000;

            const fillAmount = 200;

            const blockOne = start.unix();
            const blockTwo = start
                .clone()
                .add(10, 'day')
                .unix();

            const blockOneEvent = { blockNumber: 1, value: fillAmount };
            const blockTwoIgnoredEventOne = { blockNumber: 2, value: fillAmount };
            const blockTwoIgnoredEventTwo = { blockNumber: 2, value: fillAmount * 2 };

            const config = createConfig(
                [blockOne, blockTwo],
                [blockOneEvent, blockTwoIgnoredEventOne, blockTwoIgnoredEventTwo]
            );
            const demand = createDemand(start, end, TimeFrame.daily, energyPerTimeFrame);

            const missingEnergy = await calculateMissingEnergyDemand(demand, config);

            assert.equal(missingEnergy.length, deliveries);
            assert.equal(missingEnergy[0].value, energyPerTimeFrame - fillAmount);
            assert.equal(missingEnergy[1].value, energyPerTimeFrame);
            assert.equal(missingEnergy[2].value, energyPerTimeFrame);
        });
    });
});
