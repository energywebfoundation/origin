import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ENTITY } from './enums/Entity';
import { CustomStorage } from './storage/storage';
import { FileAdapter } from './storage/fileAdapter';
import { STATUS_CODES } from './enums/StatusCodes';

const app = express();

app.use(cors());

const storage = new CustomStorage(
    [
        ENTITY.TRADABLE_ENTITY,
        ENTITY.PRODUCING_ASSET,
        ENTITY.PRODUCING_ASSET_NOT_BOUND,
        ENTITY.CONSUMING_ASSET,
        ENTITY.DEMAND,
        ENTITY.SUPPLY,
        ENTITY.AGREEMENT,
        ENTITY.MATCHER,
        ENTITY.ORIGIN_LOOKUP_TO_MARKET_LOOKUP_MAPPING,
        ENTITY.ORIGIN_LOOKUP_TO_ASSET_LOOKUP_MAPPING
    ],
    new FileAdapter('db.json')
);

app.use(bodyParser.json());

app.use(cors());

app.options('*', cors());

function createRoutesForEntityBoundToContract(app, entity: ENTITY) {
    app.get(`/${entity}/:contractAddress/:id`, (req, res) => {
        const contractAddress = req.params.contractAddress.toLowerCase();

        console.log(`GET - ${entity} ${req.params.id} (contract ${contractAddress})`);

        const existingData = storage.get(entity, contractAddress);

        if (!existingData) {
            res.status(STATUS_CODES.NOT_FOUND).end();

            return;
        }

        if (existingData in STATUS_CODES) {
            res.status(STATUS_CODES[existingData]).end();

            return;
        }

        res.send(existingData[req.params.id]);
    });

    app.put(`/${entity}/:contractAddress/:id`, (req, res) => {
        const contractAddress = req.params.contractAddress.toLowerCase();
        console.log(`PUT - ${entity} ${req.params.id} (contract ${contractAddress})`);

        let existingData = storage.get(entity, contractAddress);

        if (!existingData) {
            existingData = {};
        }

        storage.set(entity, contractAddress, Object.assign(existingData, {
            [req.params.id]: req.body
        }));

        res.send('success');
    });

    app.delete(`/${entity}/:contractAddress/:id`, (req, res) => {
        const contractAddress = req.params.contractAddress.toLowerCase();
        console.log(`DELETE - ${entity} ${req.params.id}`);

        let existingData = storage.get(entity, contractAddress);

        if (!existingData) {
            existingData = {};
        }

        storage.set(entity, contractAddress, Object.assign(existingData, {
            [req.params.id]: STATUS_CODES.GONE
        }));

        res.send('success');
    });
}
createRoutesForEntityBoundToContract(app, ENTITY.TRADABLE_ENTITY);
createRoutesForEntityBoundToContract(app, ENTITY.PRODUCING_ASSET);
createRoutesForEntityBoundToContract(app, ENTITY.DEMAND);

/**
 * Producing Asset
 */
app.get('/ProducingAsset/:id', (req, res) => {
    console.log(`GET - ProducingAssetNotBound ${req.params.id}`);
    res.send(storage.get(ENTITY.PRODUCING_ASSET_NOT_BOUND, req.params.id));
});

app.put('/ProducingAsset/:id', (req, res) => {
    console.log(`PUT - ProducingAssetNotBound ${req.params.id}`);

    storage.set(ENTITY.PRODUCING_ASSET_NOT_BOUND, req.params.id, req.body);

    res.send('success');
});

/**
 * Consuming Asset
 */
app.get('/ConsumingAsset/:id', (req, res) => {
    console.log(`GET - ConsumingAsset ${req.params.id}`);
    res.send(storage.get(ENTITY.CONSUMING_ASSET, req.params.id));
});

app.put('/ConsumingAsset/:id', (req, res) => {
    console.log(`PUT - ConsumingAsset ${req.params.id}`);

    storage.set(ENTITY.CONSUMING_ASSET, req.params.id, req.body);

    res.send('success');
});

/**
 * Supply
 */
app.get('/Supply/:id', (req, res) => {
    console.log(`GET - Supply ${req.params.id}`);

    res.send(storage.get(ENTITY.SUPPLY, req.params.id));
});

app.put('/Supply/:id', (req, res) => {
    console.log(`PUT - Supply ${req.params.id}`);
    storage.set(ENTITY.SUPPLY, req.params.id, req.body);

    res.send('success');
});

/**
 * Agreements
 */
app.get('/Agreement/:id', (req, res) => {
    console.log(`GET - Agreement ${req.params.id}`);
    res.send(storage.get(ENTITY.AGREEMENT, req.params.id));
});

app.put('/Agreement/:id', (req, res) => {
    console.log(`PUT - Agreement ${req.params.id}`);

    storage.set(ENTITY.AGREEMENT, req.params.id, req.body);

    res.send('success');
});

/**
 * Matcher
 */
app.get('/Matcher/:id', (req, res) => {
    console.log(`GET - Matcher ${req.params.id}`);
    res.send(storage.get(ENTITY.MATCHER, req.params.id));
});

app.put('/Matcher/:id', (req, res) => {
    console.log(`PUT - Matcher ${req.params.id}`);
    storage.set(ENTITY.MATCHER, req.params.id, req.body);

    res.send('success');
});

app.get('/OriginContractLookupMarketLookupMapping/:id', (req, res) => {
    console.log(`GET - OriginContractLookupMarketLookupMapping ${req.params.id}`);

    res.send(storage.get(ENTITY.ORIGIN_LOOKUP_TO_MARKET_LOOKUP_MAPPING, req.params.id && req.params.id.toLowerCase()));
});

app.put('/OriginContractLookupMarketLookupMapping/:id', (req, res) => {
    console.log(`PUT - OriginContractLookupMarketLookupMapping ${req.params.id}`);

    storage.set(ENTITY.ORIGIN_LOOKUP_TO_MARKET_LOOKUP_MAPPING, req.params.id && req.params.id.toLowerCase(), req.body);

    res.send('success');
});

app.get('/OriginContractLookupAssetLookupMapping/:id', (req, res) => {
    console.log(`GET - OriginContractLookupAssetLookupMapping ${req.params.id}`);

    res.send(storage.get(ENTITY.ORIGIN_LOOKUP_TO_ASSET_LOOKUP_MAPPING, req.params.id && req.params.id.toLowerCase()));
});

app.put('/OriginContractLookupAssetLookupMapping/:id', (req, res) => {
    console.log(`PUT - OriginContractLookupAssetLookupMapping ${req.params.id}`);

    storage.set(ENTITY.ORIGIN_LOOKUP_TO_ASSET_LOOKUP_MAPPING, req.params.id && req.params.id.toLowerCase(), req.body);

    res.send('success');
});

(async () => {
    await storage.initialize();

    app.listen(3030);
})()

