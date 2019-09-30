
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ENTITY } from './enums/Entity';
import { CustomStorage } from './storage/storage';
import { FileAdapter } from './storage/fileAdapter';
import { STATUS_CODES } from './enums/StatusCodes';

export async function startAPI(port?: number) {
    const app: Express = express();

    app.use(cors());
    app.set('case sensitive routing', false);

    const storage = new CustomStorage(
        [
            ENTITY.USER,
            ENTITY.TRADABLE_ENTITY,
            ENTITY.PRODUCING_ASSET,
            ENTITY.CONSUMING_ASSET,
            ENTITY.DEMAND,
            ENTITY.SUPPLY,
            ENTITY.AGREEMENT
        ],
        new FileAdapter('db.json')
    );

    app.use(bodyParser.json());

    app.use(cors());

    app.options('*', cors());

    function createRoutesForEntityBoundToContract(app: Express, entity: ENTITY) {
        app.get(`/${entity}/:contractAddress/:id`, (req, res) => {
            const contractAddress = req.params.contractAddress.toLowerCase();

            console.log(`GET - ${entity} ${req.params.id} (contract ${contractAddress})`);

            const existingData: any = storage.get(entity, contractAddress);

            if (!existingData) {
                res.status(STATUS_CODES.NOT_FOUND).end();

                return;
            }

            if (existingData in STATUS_CODES) {
                res.status(existingData).end();

                return;
            }

            res.send(existingData[req.params.id]);
        });

        app.put(`/${entity}/:contractAddress/:id`, (req, res) => {
            const contractAddress = req.params.contractAddress.toLowerCase();
            console.log(`PUT - ${entity} ${req.params.id} (contract ${contractAddress})`);

            let existingData: any = storage.get(entity, contractAddress);

            if (!existingData) {
                existingData = {};
            }

            storage.set(
                entity,
                contractAddress,
                Object.assign(existingData, {
                    [req.params.id]: req.body
                })
            );

            res.send('success');
        });

        app.delete(`/${entity}/:contractAddress/:id`, (req, res) => {
            const contractAddress = req.params.contractAddress.toLowerCase();
            console.log(`DELETE - ${entity} ${req.params.id}`);

            let existingData: any = storage.get(entity, contractAddress);

            if (!existingData) {
                existingData = {};
            }

            storage.set(
                entity,
                contractAddress,
                Object.assign(existingData, {
                    [req.params.id]: STATUS_CODES.GONE
                })
            );

            res.send('success');
        });
    }

    createRoutesForEntityBoundToContract(app, ENTITY.USER);
    createRoutesForEntityBoundToContract(app, ENTITY.TRADABLE_ENTITY);
    createRoutesForEntityBoundToContract(app, ENTITY.PRODUCING_ASSET);
    createRoutesForEntityBoundToContract(app, ENTITY.CONSUMING_ASSET);
    createRoutesForEntityBoundToContract(app, ENTITY.DEMAND);

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

    app.get('/OriginContractLookupMarketLookupMapping/:id?', (req, res) => {
        console.log(`GET - OriginContractLookupMarketLookupMapping ${req.params.id}`);

        res.send(
            storage.get(
                ENTITY.ORIGIN_LOOKUP,
                req.params.id !== undefined ? req.params.id.toLowerCase() : null
            )
        );
    });

    app.put('/OriginContractLookupMarketLookupMapping/:id', (req, res) => {
        console.log(`PUT - OriginContractLookupMarketLookupMapping ${req.params.id}`);

        storage.set(
            ENTITY.ORIGIN_LOOKUP,
            req.params.id && req.params.id.toLowerCase(),
            req.body
        );

        res.send('success');
    });

    await storage.initialize();

    return app.listen(port || process.env.PORT || 3030);
}
