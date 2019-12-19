import * as http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';

import express, { Express } from 'express';
import { createConnection, Connection, ConnectionOptions } from 'typeorm';

import ormConfig from '../ormconfig.json';

import { Currency } from './entity/Currency';
import { Compliance } from './entity/Compliance';
import { JsonEntity } from './entity/JsonEntity';
import { MarketContractLookup } from './entity/MarketContractLookup';

import api from './api';

function extractPort(url: string): number {
    if (url) {
        const backendUrlSplit: string[] = url.split(':');
        const extractedPort: number = parseInt(backendUrlSplit[backendUrlSplit.length - 1], 10);

        return extractedPort;
    }

    return null;
}

const app: Express = express();

app.use(bodyParser.json());
app.use(cors());
app.set('case sensitive routing', false);
app.options('*', cors());

app.use('/api', api);
app.use('/api/v1', api);

export async function startAPI(): Promise<http.Server> {
    const PORT: number =
        parseInt(process.env.PORT, 10) || extractPort(process.env.BACKEND_URL) || 3030;

    if (process.env.ORM_TYPE) {
        ormConfig.type = process.env.ORM_TYPE;
    }
    if (process.env.ORM_DATABASE_DOCKER === 'TRUE') {
        ormConfig.database = '/var/db/db.sqlite';
    }

    let connectionOptions: ConnectionOptions = Object.assign(ormConfig as ConnectionOptions, {
        entities: [JsonEntity, MarketContractLookup, Currency, Compliance]
    });

    const connection: Connection = await createConnection(connectionOptions);
    const server: http.Server = app.listen(PORT, () => {
        console.log(`Running the test backend on port: ${PORT}`);

        server.on('close', () => {
            connection.close();
        });
    });

    console.log(`Express application is up and running on port ${PORT}`);
    return server;
}
