import "reflect-metadata";
import * as http from "http";

import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection, Connection, ConnectionOptions } from 'typeorm';

import ormConfig from '../ormconfig.json';

import { StorageErrors } from './enums/StorageErrors';
import { STATUS_CODES } from './enums/StatusCodes';
import { AnyEntity } from "./entity/AnyEntity";
import { MarketContractLookup } from "./entity/MarketContractLookup";
import { EntityType } from './entity/EntityType';

export async function startAPI(port?: number) {
    const app: Express = express();

    let connectionOptions: ConnectionOptions = Object.assign(
        ormConfig as ConnectionOptions,
        { entities: [AnyEntity, MarketContractLookup, EntityType] }
    );
    const connection: Connection = await createConnection(connectionOptions);

    const getOrCreateEntityType = async(name: string): Promise<EntityType> => {
        const entityTypeRepository = await connection.getRepository(EntityType);
        let entityType: EntityType = await entityTypeRepository.findOne(name);
    
        if (!entityType) {
            entityType = new EntityType();
            entityType.name = name;
    
            await entityTypeRepository.save(entityType);
        }
    
        return entityType;
    }

    app.use(cors());
    app.set('case sensitive routing', false);

    app.use(bodyParser.json());

    app.options('*', cors());

    app.get(`/MarketContractLookup`, async (req: Request, res: Response): Promise<void> => {
        console.log(`GET - MarketContractLookup`);
        const marketContractLookupRepository = connection.getRepository(MarketContractLookup);

        const contracts: MarketContractLookup[] = await marketContractLookupRepository.find();

        res.send(
            contracts.map(contract => contract.address)
        );
    });

    app.post(`/MarketContractLookup/:address`, async (req: Request, res: Response): Promise<void> => {
        let { address } = req.params;
        address = address.toLowerCase();

        console.log(`POST - MarketContractLookup: ${address}`);

        const marketContractLookupRepository = connection.getRepository(MarketContractLookup);
        const marketAddresses: string[] = (await marketContractLookupRepository.find()).map(contract => contract.address);

        if (marketAddresses.includes(address)) {
            res.status(STATUS_CODES.CONFLICT).send({
                error: StorageErrors.ALREADY_EXISTS
            });

            return;
        }

        const newMarketContractLookup = new MarketContractLookup();
        newMarketContractLookup.address = address.toLowerCase();

        await marketContractLookupRepository.save(newMarketContractLookup);

        res.status(STATUS_CODES.CREATED).send({
            message: `MarketContractLookup ${address} created`
        });
    });

    app.delete(`/MarketContractLookup/:address`, async (req: Request, res: Response): Promise<void> => {
        const { address } = req.params;

        console.log(`DELETE - MarketContractLookup ${address}`);

        const marketContractLookupRepository = connection.getRepository(MarketContractLookup);
        const marketContractLookup: MarketContractLookup = await marketContractLookupRepository.findOne(
            address.toLowerCase()
        );

        if (!marketContractLookup) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT_ENTITY
            });

            return;
        }

        await marketContractLookupRepository.remove(marketContractLookup);

        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `MarketContractLookup with address ${address} successfully deleted`
        });
    });

    app.get(`/:type/:contractAddress/:identifier?`, async (req: Request, res: Response): Promise<void> => {
        let { contractAddress, type, identifier } = req.params;
        contractAddress = contractAddress.toLowerCase();

        console.log(`<${contractAddress}> GET - ${type} ${identifier}`);

        const entityType: EntityType = await getOrCreateEntityType(type);
        const anyEntityRepository = connection.getRepository(AnyEntity);

        if (identifier === undefined || identifier === null) {
            const entities: AnyEntity[] = await anyEntityRepository.find({
                contractAddress,
                type: entityType
            });

            res.send(entities);

            return;
        }
        
        const existingEntity: AnyEntity = await anyEntityRepository.findOne({
            contractAddress,
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

    app.post(`/:type/:contractAddress/:identifier`, async (req: Request, res: Response): Promise<void> => {
        let { contractAddress, type, identifier } = req.params;
        contractAddress = contractAddress.toLowerCase();

        console.log(`<${contractAddress}> POST - ${type} ${identifier}`);

        const entityType: EntityType = await getOrCreateEntityType(type);
        const anyEntityRepository = connection.getRepository(AnyEntity);

        try {
            const newEntity: AnyEntity = new AnyEntity();

            newEntity.contractAddress = contractAddress;
            newEntity.identifier = identifier;
            newEntity.type = entityType;
            newEntity.value = JSON.stringify(req.body);

            await anyEntityRepository.save(newEntity);
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

    app.put(`/:type/:contractAddress/:identifier`, async (req: Request, res: Response): Promise<void> => {
        let { contractAddress, type, identifier } = req.params;
        contractAddress = contractAddress.toLowerCase();

        console.log(`<${contractAddress}> POST - ${type} ${identifier}`);

        const entityType: EntityType = await getOrCreateEntityType(type);
        const anyEntityRepository = connection.getRepository(AnyEntity);

        const existingEntity: AnyEntity = await anyEntityRepository.findOne({
            contractAddress,
            type: entityType,
            identifier
        });

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT_ENTITY
            });

            return;
        }

        existingEntity.value = JSON.stringify(req.body);

        res.status(STATUS_CODES.SUCCESS).send({
            message: `Resource ${type} with ID ${identifier} updated`
        });
    });

    app.delete(`/:type/:contractAddress/:identifier`, async (req: Request, res: Response): Promise<void> => {
        let { contractAddress, type, identifier } = req.params;
        contractAddress = contractAddress.toLowerCase();

        console.log(`<${contractAddress}> DELETE - ${type} ${identifier}`);

        const entityType: EntityType = await getOrCreateEntityType(type);
        const anyEntityRepository = connection.getRepository(AnyEntity);

        let existingEntity: AnyEntity;
        
        existingEntity = await anyEntityRepository.findOne({
            contractAddress,
            type: entityType,
            identifier
        });

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT_ENTITY
            });

            return;
        }

        await anyEntityRepository.remove(existingEntity);

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
