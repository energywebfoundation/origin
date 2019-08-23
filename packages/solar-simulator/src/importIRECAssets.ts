import program from 'commander';
import parse from 'csv-parse/lib/sync';
import fs from 'fs';
import Web3 from 'web3';

import CONFIG from '../config/config.json';

const configLocation = 'config/config.json';
const web3 = new Web3(CONFIG.config.WEB3_URL);

program.option('-i, --input <path>', 'input I-REC csv file');
program.option('-o, --owner <address>', 'address of the asset owner');
program.option('-m, --matcher <address>', 'address of the asset matcher');

program.parse(process.argv);

if (!program.input) {
    console.error(`Missing -i argument`);
    process.exit(1);
}

if (!fs.existsSync(program.input)) {
    console.error(`${program.input} file does not exist`);
    process.exit(1);
}

const parseAddress = (country, address) => {
    console.log(address);
    if (country === 'Thailand') {
        const zipRegex = /[0-9]{5}/;
        const split = address.split(',').reverse();
        console.log(split);
        const province = split[0];

        const matchZapResult = province.match(zipRegex);
        const zip = matchZapResult ? matchZapResult[0].trim() : '';

        const region = zip ? (province.split(zipRegex)[0] || '').trim() : '';

        return {
            street: (split[3] || '').trim(),
            city: (split[2] || '').trim(),
            zip,
            region
        };
    } else {
        console.log(`country ${country} not implemented`);

        return {
            street: '',
            city: '',
            zip: '',
            region: ''
        };
    }
};

const processAssets = async parsedContent => {
    const assets = [];
    const flow = [];

    let id = 0;
    for (const asset of parsedContent) {
        console.log('---');
        console.log(`Processing ${asset['Device ID']} asset`);

        const maxCapacity = parseFloat(asset['Electrical Capacity (MW)']) * 10 ** 6;
        const country = asset.Country.split(':')[1].trim();
        const address = asset['Address (ex. Country)'];

        const { street, city, zip, region } = parseAddress(country, address);

        const name = asset.Name;
        const registrationDate = asset['Registration Date'];
        const latitude = parseFloat(asset.Latitude);
        const longitude = parseFloat(asset.Longitude);
        const assetType = asset.Technology.split(':')[1].trim();

        const account = web3.eth.accounts.create();

        console.log(`Generated smart meter address ${account.address}`);

        assets.push({
            id: (id++).toString(),
            maxCapacity,
            smartMeterPrivateKey: account.privateKey,
            role: 'producer',
            manufacturer: '',
            model: '',
            serial_number: '',
            latitude,
            longitude,
            energy_unit: 'wattHour'
        });

        flow.push({
            type: 'CREATE_PRODUCING_ASSET',
            data: {
                smartMeter: account.address,
                smartMeterPK: account.privateKey,
                owner: program.owner || '',
                matcher: program.matcher || '',
                operationalSince: new Date(registrationDate).getTime() / 1000,
                capacityWh: maxCapacity,
                lastSmartMeterReadWh: 0,
                active: true,
                lastSmartMeterReadFileHash: '',
                country,
                region,
                zip,
                city,
                street,
                houseNumber: '',
                gpsLatitude: latitude.toString(),
                gpsLongitude: longitude.toString(),
                assetType,
                certificatesCreatedForWh: 0,
                lastSmartMeterCO2OffsetRead: 0,
                complianceRegistry: 'IREC',
                otherGreenAttributes: 'N.A.',
                typeOfPublicSupport: 'N.A',
                maxOwnerChanges: 1000,
                facilityName: name
            }
        });
    }

    return { assets, flow };
};

const parseContent = path => {
    const inputContent = fs.readFileSync(path);

    return parse(inputContent, { columns: true, trim: true });
};

(async () => {
    console.log('----- Starting importing I-REC assets to local config file -----');

    const parsedContent = parseContent(program.input);

    console.log(`Found ${parsedContent.length} assets in ${program.input}`);

    const { assets, flow } = await processAssets(parsedContent);
    const updatedConfig = JSON.stringify({ ...CONFIG, assets }, null, 2);

    fs.writeFileSync(configLocation, updatedConfig);

    console.log(`----- New assets stored in ${configLocation}`);

    console.log(JSON.stringify(flow, null, 2));
})();
