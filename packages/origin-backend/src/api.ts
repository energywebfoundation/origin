import "reflect-metadata";
import * as http from "http";

import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection, Connection, ConnectionOptions, AdvancedConsoleLogger } from 'typeorm';

import ormConfig from '../ormconfig.json';

import { StorageErrors } from './enums/StorageErrors';
import { STATUS_CODES } from './enums/StatusCodes';
import { AnyEntity } from "./entity/AnyEntity";
import { Contract } from "./entity/Contract";
import { EntityType } from './entity/EntityType';

export async function startAPI(port?: number) {
    const app: Express = express();

    const connectionOptions: ConnectionOptions = ormConfig as ConnectionOptions;
    const connection: Connection = await createConnection(connectionOptions);

    app.use(cors());
    app.set('case sensitive routing', false);

    app.use(bodyParser.json());

    app.options('*', cors());

    app.get(`/contract`, async (req: Request, res: Response): Promise<void> => {
        console.log(`GET - contractAddresses`);
        const contractAddresses: Contract[] = await Contract.find();

        res.send(
            contractAddresses.map(contract => contract.address)
        );
    });

    app.post(`/contract/:address`, async (req: Request, res: Response): Promise<void> => {
        let { address } = req.params;
        address = address.toLowerCase();

        console.log(`POST - Contract Address: ${address}`);
        const contractAddresses: string[] = (await Contract.find()).map(contract => contract.address);

        if (contractAddresses.includes(address)) {
            res.status(STATUS_CODES.CONFLICT).send({
                error: StorageErrors.ALREADY_EXISTS
            });

            return;
        }

        const contract = new Contract();
        contract.address = address.toLowerCase();

        await contract.save();

        res.status(STATUS_CODES.CREATED).send({
            message: `Contract Address ${address} created`
        });
    });

    app.delete(`/contract/:address`, async (req: Request, res: Response): Promise<void> => {
        const { address } = req.params;

        console.log(`DELETE - Contract Address ${address}`);

        try {
            const contractAddress: Contract = await Contract.findOne(
                address.toLowerCase()
            );
            await contractAddress.remove();
        } catch (e) {
            if (Object.values(StorageErrors).includes(e.message)) {
                res.status(STATUS_CODES.GONE).send({
                    error: e.message
                });
    
                return;
            }

            throw e;
        }

        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `Contract address ${address} successfully deleted`
        });
    });

    app.get(`/:contractAddress/:type/:identifier?`, async (req: Request, res: Response): Promise<void> => {
        const { contractAddress, type, identifier } = req.params;

        console.log(`<${contractAddress}> GET - ${type} ${identifier}`);

        const contract: Contract = await getOrCreateContractAddress(contractAddress.toLowerCase());
        const entityType: EntityType = await getOrCreateEntityType(type);

        if (identifier === undefined || identifier === null) {
            const entities: AnyEntity[] = await AnyEntity.find({
                contract,
                type: entityType
            });

            res.send(entities);

            return;
        }
        
        const existingEntity: AnyEntity = await AnyEntity.findOne({
            contract,
            type: entityType,
            identifier
        });

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT_ENTITY
            });

            return;
        }

        res.send(JSON.parse(existingEntity.value));
    });

    app.post(`/:contractAddress/:type/:identifier`, async (req: Request, res: Response): Promise<void> => {
        const { contractAddress, type, identifier } = req.params;

        console.log(`<${contractAddress}> POST - ${type} ${identifier}`);

        const contract: Contract = await getOrCreateContractAddress(contractAddress.toLowerCase());
        const entityType: EntityType = await getOrCreateEntityType(type);

        try {
            const newEntity: AnyEntity = new AnyEntity();

            newEntity.contract = contract;
            newEntity.identifier = identifier;
            newEntity.type = entityType;
            newEntity.value = JSON.stringify(req.body);

            await newEntity.save();
        } catch (e) {
            if (e.message.includes('UNIQUE constraint failed')) {
                res.status(STATUS_CODES.CONFLICT).send({
                    error: StorageErrors.ALREADY_EXISTS
                });
    
                return;
            }

            throw e;
        }

        res.status(STATUS_CODES.CREATED).send({
            message: `Resource ${type} with ID ${identifier} created`
        });
    });

    app.delete(`/:contractAddress/:type/:identifier`, async (req: Request, res: Response): Promise<void> => {
        const { contractAddress, type, identifier } = req.params;

        console.log(`<${contractAddress}> DELETE - ${type} ${identifier}`);

        const contract: Contract = await getOrCreateContractAddress(contractAddress.toLowerCase());
        const entityType: EntityType = await getOrCreateEntityType(type);

        let existingEntity: AnyEntity;
        
        existingEntity = await AnyEntity.findOne({
            contract: contract,
            type: entityType,
            identifier
        });

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT_ENTITY
            });

            return;
        }

        await existingEntity.remove();

        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `${type} with ID ${identifier} successfully deleted`
        });
    });
    
    const backendPort: number = parseInt(process.env.PORT, 10) || port || 3030;

    console.log(`Running the test backend on port: ${backendPort}`);

    const server: http.Server = app.listen(backendPort, () => {
        server.on('close', () => {
            connection.close();
        });
    });

    return server;
}

async function getOrCreateContractAddress(address: string): Promise<Contract> {
    let contract: Contract = await Contract.findOne(address);

    if (!contract) {
        contract = new Contract();
        contract.address = address;

        await contract.save();
    }

    return contract;
}

async function getOrCreateEntityType(name: string): Promise<EntityType> {
    let entityType: EntityType = await EntityType.findOne(name);

    if (!entityType) {
        entityType = new EntityType();
        entityType.name = name;

        await entityType.save();
    }

    return entityType;
}