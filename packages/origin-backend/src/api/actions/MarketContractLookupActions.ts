import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { MarketContractLookup } from "../../entity/MarketContractLookup";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

import { IActions } from './IActions';

export const MarketContractLookupActions: IActions = {
    get: async (req: Request, res: Response) => {
        console.log(`GET - MarketContractLookup`);
        const marketContractLookupRepository = getRepository(MarketContractLookup);
    
        const contracts = await marketContractLookupRepository.find();
    
        res.send(
            contracts.map(contract => contract.address)
        );
    },
    post: async (req: Request, res: Response) => {
        let { value } = req.body;
        value = value.toLowerCase();
    
        console.log(`POST - MarketContractLookup: ${value}`);
    
        const marketContractLookupRepository = getRepository(MarketContractLookup);
        const marketContracts = await marketContractLookupRepository.find();
        const marketAddresses = marketContracts.map(contract => contract.address);
    
        if (marketAddresses.includes(value)) {
            res.status(STATUS_CODES.SUCCESS).send({
                message: StorageErrors.ALREADY_EXISTS
            });
    
            return;
        }
    
        const newMarketContractLookup = new MarketContractLookup();
        newMarketContractLookup.address = value.toLowerCase();
    
        await marketContractLookupRepository.save(newMarketContractLookup);
    
        res.status(STATUS_CODES.CREATED).send({
            message: `MarketContractLookup ${value} created`
        });
    },
    delete: async (req: Request, res: Response) => {
        let { value } = req.body;
        value = value.toLowerCase();
    
        console.log(`DELETE - MarketContractLookup ${value}`);
    
        const marketContractLookupRepository = getRepository(MarketContractLookup);
        const marketContractLookup = await marketContractLookupRepository.findOne(value);
    
        if (!marketContractLookup) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        await marketContractLookupRepository.remove(marketContractLookup);
    
        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `MarketContractLookup ${value} successfully deleted`
        });
    }
}
