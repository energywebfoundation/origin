import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Entity } from './entity';
import { CustomStorage } from './storage/storage';
import { FileAdapter } from './storage/fileAdapter';
import ENV from '../env.json';

const app = express();

const corsOptions = Object.freeze({
    origin: ENV.CORS_ORIGIN,
    optionsSuccessStatus: 200
});

const storage = new CustomStorage(
    [
        Entity.PRODUCING_ASSET,
        Entity.CONSUMING_ASSET,
        Entity.DEMAND,
        Entity.SUPPLY,
        Entity.AGREEMENT,
        Entity.MATCHER,
        Entity.ORIGIN_LOOKUP_TO_MARKET_LOOKUP_MAPPING
    ],
    new FileAdapter('db.json')
);

app.use(bodyParser.json());

app.options('*', cors());

/**
 * Producing Asset
 */
app.get('/ProducingAsset/:contractAddress/:id', cors(corsOptions), (req, res) => {
    const contractAddress = req.params.contractAddress.toLowerCase();

    console.log(`GET - ProducingAsset ${req.params.id} (contract ${contractAddress})`);

    const existingData = storage.get(Entity.PRODUCING_ASSET, contractAddress);

    if (existingData) {
        res.send(existingData[req.params.id]);
    }
});

app.put('/ProducingAsset/:contractAddress/:id', cors(corsOptions), (req, res) => {
    const contractAddress = req.params.contractAddress.toLowerCase();
    console.log(`PUT - ProducingAsset ${req.params.id} (contract ${contractAddress})`);

    let existingData = storage.get(Entity.PRODUCING_ASSET, contractAddress);

    if (!existingData) {
        existingData = {};
    }

    storage.set(Entity.PRODUCING_ASSET, contractAddress, Object.assign(existingData, {
        [req.params.id]: req.body
    }));

    res.send('success');
});

/**
 * Consuming Asset
 */
app.get('/ConsumingAsset/:id', cors(corsOptions), (req, res) => {
    console.log(`GET - ConsumingAsset ${req.params.id}`);
    res.send(storage.get(Entity.CONSUMING_ASSET, req.params.id));
});

app.put('/ConsumingAsset/:id', cors(corsOptions), (req, res) => {
    console.log(`PUT - ConsumingAsset ${req.params.id}`);

    storage.set(Entity.CONSUMING_ASSET, req.params.id, req.body);

    res.send('success');
});

/**
 * Demand
 */
app.get('/Demand/:id', cors(corsOptions), (req, res) => {
    console.log(`GET - Demand ${req.params.id}`);

    res.send(storage.get(Entity.DEMAND, req.params.id));
});

app.put('/Demand/:id', cors(corsOptions), (req, res) => {
    console.log(`PUT - Demand ${req.params.id}`);

    storage.set(Entity.DEMAND, req.params.id, req.body);

    res.send('success');
});

/**
 * Supply
 */
app.get('/Supply/:id', cors(corsOptions), (req, res) => {
    console.log(`GET - Supply ${req.params.id}`);

    res.send(storage.get(Entity.SUPPLY, req.params.id));
});

app.put('/Supply/:id', cors(corsOptions), (req, res) => {
    console.log(`PUT - Supply ${req.params.id}`);
    storage.set(Entity.SUPPLY, req.params.id, req.body);

    res.send('success');
});

/**
 * Agreements
 */
app.get('/Agreement/:id', cors(corsOptions), (req, res) => {
    console.log(`GET - Agreement ${req.params.id}`);
    res.send(storage.get(Entity.AGREEMENT, req.params.id));
});

app.put('/Agreement/:id', cors(corsOptions), (req, res) => {
    console.log(`PUT - Agreement ${req.params.id}`);

    storage.set(Entity.AGREEMENT, req.params.id, req.body);

    res.send('success');
});

/**
 * Matcher
 */
app.get('/Matcher/:id', cors(corsOptions), (req, res) => {
    console.log(`GET - Matcher ${req.params.id}`);
    res.send(storage.get(Entity.MATCHER, req.params.id));
});

app.put('/Matcher/:id', cors(corsOptions), (req, res) => {
    console.log(`PUT - Matcher ${req.params.id}`);
    storage.set(Entity.MATCHER, req.params.id, req.body);

    res.send('success');
});

app.get('/OriginContractLookupMarketLookupMapping/:id', cors(corsOptions), (req, res) => {
    console.log(`GET - OriginContractLookupMarketLookupMapping ${req.params.id}`);

    res.send(storage.get(Entity.ORIGIN_LOOKUP_TO_MARKET_LOOKUP_MAPPING, req.params.id && req.params.id.toLowerCase()));
});

app.put('/OriginContractLookupMarketLookupMapping/:id', cors(corsOptions), (req, res) => {
    console.log(`PUT - OriginContractLookupMarketLookupMapping ${req.params.id}`);

    storage.set(Entity.ORIGIN_LOOKUP_TO_MARKET_LOOKUP_MAPPING, req.params.id && req.params.id.toLowerCase(), req.body);

    res.send('success');
});

(async () => {
    await storage.initialize();

    app.listen(3030);
})()

