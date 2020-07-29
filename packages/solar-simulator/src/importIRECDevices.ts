import program from 'commander';
import parse from 'csv-parse/lib/sync';
import { utils, BigNumber } from 'ethers';
import fs from 'fs';
import geoTz from 'geo-tz';

import CONFIG from '../config/config.json';

const configLocation = 'config/config.json';

let generatedAccountIndex = CONFIG.config.ACCOUNT_GENERATION.startIndex;
function generateNextAccount() {
    const node = utils.HDNode.fromMnemonic(CONFIG.config.ACCOUNT_GENERATION.mnemonic);
    const wallet = node.derivePath(`m/44'/60'/0'/0/${generatedAccountIndex}`);

    generatedAccountIndex++;

    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
}

program.option('-i, --input <path>', 'input I-REC csv file');
program.option('-o, --owner <address>', 'address of the device owner');

program.parse(process.argv);

if (!program.input) {
    console.error(`Missing -i argument`);
    process.exit(1);
}

if (!fs.existsSync(program.input)) {
    console.error(`${program.input} file does not exist`);
    process.exit(1);
}

const processDevices = async (parsedContent) => {
    const devices = [];
    const flow = [];

    geoTz.preCache();

    let id = 0;
    for (const device of parsedContent) {
        console.log('---');
        console.log(`Processing ${device['Device ID']} device`);

        const maxCapacity = parseFloat(device['Electrical Capacity (MW)']) * 10 ** 6;
        const country = device.Country.split(':')[1].trim();
        const address = device['Address (ex. Country)'];

        const name = device.Name;
        const registrationDate = device['Registration Date'];
        const latitude = parseFloat(device.Latitude);
        const longitude = parseFloat(device.Longitude);
        const deviceType = device.Technology.split(':')[1].trim();
        const timezone = geoTz(latitude, longitude)[0];

        const account = generateNextAccount();

        console.log(`Generated smart meter address ${account.address}`);

        devices.push({
            id: (id++).toString(),
            maxCapacity,
            smartMeterPrivateKey: account.privateKey,
            role: 'producer',
            manufacturer: '',
            model: '',
            serial_number: '',
            latitude,
            longitude,
            timezone,
            energy_unit: 'wattHour'
        });

        flow.push({
            type: 'CREATE_PRODUCING_DEVICE',
            data: {
                smartMeter: account.address,
                smartMeterPK: account.privateKey,
                owner: program.owner || '',
                operationalSince: new Date(registrationDate).getTime() / 1000,
                capacityInW: maxCapacity,
                lastSmartMeterReadWh: BigNumber.from(0),
                active: true,
                country,
                address,
                gpsLatitude: latitude.toString(),
                gpsLongitude: longitude.toString(),
                timezone,
                deviceType,
                complianceRegistry: 'IREC',
                otherGreenAttributes: 'N.A.',
                typeOfPublicSupport: 'N.A',
                facilityName: name
            }
        });
    }

    return { devices, flow };
};

const parseContent = (path: string) => {
    const inputContent = fs.readFileSync(path);

    return parse(inputContent, { columns: true, trim: true });
};

(async () => {
    console.log('----- Starting importing I-REC devices to local config file -----');

    const parsedContent = parseContent(program.input);

    console.log(`Found ${parsedContent.length} devices in ${program.input}`);

    const { devices, flow } = await processDevices(parsedContent);
    const updatedConfig = JSON.stringify({ ...CONFIG, devices }, null, 2);

    fs.writeFileSync(configLocation, updatedConfig);

    console.log(`----- New devices stored in ${configLocation}`);

    console.log(JSON.stringify(flow, null, 2));
})();
