import axios from 'axios';
import 'mocha';
import dotenv from 'dotenv';
import { assert } from 'chai';
import * as fs from 'fs';
import moment from 'moment';
import { INestApplication } from '@nestjs/common';
import { DemandPostData } from '@energyweb/origin-backend-core';

import { startAPI } from '../..';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { EventService } from '../../events/events.service';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Demand API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: INestApplication;
    let eventsClient: EventService;

    const BASE_API_URL = `http://localhost:${process.env.PORT}/api`;

    const testDemand: DemandPostData = {
        owner: '0x0000000000000000000000000000000000000000',
        timeFrame: 1,
        maxPriceInCentsPerMwh: 100,
        currency: 'USD',
        location: ['Thailand;Central;Nakhon Pathom'],
        deviceType: ['Solar'],
        minCO2Offset: 10,
        otherGreenAttributes: 'string',
        typeOfPublicSupport: 'string',
        energyPerTimeFrame: 10,
        registryCompliance: 'I-REC',
        startTime: moment().unix(),
        endTime: moment().add(1, 'month').unix(),
        procureFromSingleFacility: true,
        automaticMatching: true,
        vintage: [2019, 2020]
    };

    beforeEach(async () => {
        apiServer = await startAPI();
        eventsClient = new EventService(`http://localhost:${parseInt(process.env.PORT, 10) + 1}`);
        eventsClient.start();
    });

    afterEach(async () => {
        await apiServer.close();
        await sleep(100);

        try {
            fs.unlinkSync('db.sqlite');
        } catch (err) {}
    });

    describe('POST', () => {
        it('creates a Demand', async () => {
            const postResult = await axios.post(`${BASE_API_URL}/Demand`, testDemand);

            assert.equal(postResult.status, STATUS_CODES.CREATED);

            await sleep(1000);

            const allEvents = eventsClient.allEvents;
            assert.equal(allEvents.length, 1);
            
            const creationEvent = allEvents[0];

            assert.equal(creationEvent.name, 'createdNewDemand');
            assert.equal(creationEvent.data.demandId, postResult.data.id);
        });
    });
});
