/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import dotenv from 'dotenv';
import { validateOrReject } from 'class-validator';

import { IRECAPIClient } from '../src/IRECAPIClient';
import { Device, DeviceCreateUpdateParams, DeviceState } from '../src/Device';

dotenv.config();

describe('Device API tests', () => {
    let client: IRECAPIClient;

    const tradeAccount = 'ACCOUNTTRADE001';

    before(async () => {
        client = new IRECAPIClient(process.env.IREC_API_URL);
        await client.login(
            process.env.IREC_API_LOGIN,
            process.env.IREC_API_PASSWORD,
            process.env.IREC_API_CLIENT_ID,
            process.env.IREC_API_CLIENT_SECRET
        );
    });

    it('should pass create and approve device flow', async () => {
        const deviceCode = `TestDevice${Date.now()}`;

        const params: DeviceCreateUpdateParams = {
            address: '1 Wind Farm Avenue, London',
            capacity: 500,
            code: deviceCode,
            commissioningDate: new Date('2001-08-10'),
            countryCode: 'GB',
            defaultAccount: tradeAccount,
            deviceType: 'T020001',
            fuel: 'ES200',
            issuer: 'ORGANISATION006',
            latitude: 53.405088,
            longitude: -1.744222,
            name: 'DeviceXYZ',
            notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            registrantOrganization: 'ORGANISATION001',
            registrationDate: new Date('2001-09-20')
        };
        await client.device.create(params);

        let device: Device = await client.device.get(deviceCode);
        expect(device.code).to.equal(deviceCode);
        expect(device.name).to.equal(params.name);
        expect(device.capacity).to.equal(params.capacity);
        expect(device.status).to.equal(DeviceState.Draft);
        await validateOrReject(device);

        await client.device.submit(deviceCode, { notes: 'Some submit note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Submitted);

        await client.device.verify(deviceCode, { notes: 'Some verify note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Verified);

        await client.device.refer(deviceCode, { notes: 'Some refer note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Referred);

        await client.device.reject(deviceCode, { notes: 'Some reject note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Rejected);

        await client.device.submit(deviceCode, { notes: 'Some submit note 2' });
        await client.device.verify(deviceCode, { notes: 'Some verify note 2' });
        await client.device.approve(deviceCode, { notes: 'Some approve note' });
        device = await client.device.get(deviceCode);
        expect(device.status).to.equal(DeviceState.Approved);

        await client.device.edit(deviceCode, { capacity: 1000, name: 'DeviceZZZ' });
        device = await client.device.get(deviceCode);
        expect(device.capacity).to.equal(1000);
        expect(device.name).to.equal('DeviceZZZ');
        expect(device.status).to.equal(DeviceState.Draft);
    }).timeout(10000);
});
