import dotenv from 'dotenv';
import * as http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'reflect-metadata';
import express, { Express } from 'express';
import { createConnection, Connection, ConnectionOptions } from 'typeorm';

import ormConfig from '../ormconfig.json';

import { EntityType } from './entity/EntityType';
import { AnyEntity } from './entity/AnyEntity';
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

dotenv.config({
    path: '../../.env'
});

const PORT: number = extractPort(process.env.BACKEND_URL);

const app: Express = express();

app.use(bodyParser.json());
app.use(cors());
app.set('case sensitive routing', false);
app.options('*', cors());

app.use('/api/v1', api);

export async function startAPI(): Promise<http.Server> {
    let connectionOptions: ConnectionOptions = Object.assign(
        ormConfig as ConnectionOptions,
        { entities: [AnyEntity, MarketContractLookup, EntityType] }
    );

    const connection: Connection = await createConnection(connectionOptions);
    const server: http.Server = api.listen(PORT, () => {
        console.log(`Running the test backend on port: ${PORT}`);

        server.on('close', () => {
            connection.close();
        });
    });

    console.log(`Express application is up and running on port ${PORT}`);
    return server;
}

if (require.main === module) {
    startAPI();
}