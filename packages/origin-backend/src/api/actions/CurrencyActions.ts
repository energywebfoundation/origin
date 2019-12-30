import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { Currency } from "../../entity/Currency";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

import { IActions } from './IActions';

export const CurrencyActions: IActions = {
    get: async (req: Request, res: Response) => {
        console.log(`GET - Currency`);
        const currencyRepository = getRepository(Currency);
    
        const currencies = await currencyRepository.find();
    
        res.send(
            currencies.map(currency => currency.code)
        );
    },
    post: async (req: Request, res: Response) => {
        let { value } = req.body;
        value = value.toUpperCase();
    
        console.log(`POST - Currency: ${value}`);
    
        const currencyRepository = getRepository(Currency);
        const currencies = await currencyRepository.find();
        const currencyCodes = currencies.map(currency => currency.code);
    
        if (currencyCodes.includes(value)) {
            res.status(STATUS_CODES.SUCCESS).send({
                message: StorageErrors.ALREADY_EXISTS
            });
    
            return;
        }
    
        const newCurrency = new Currency();
        newCurrency.code = value.toUpperCase();
    
        await currencyRepository.save(newCurrency);
    
        res.status(STATUS_CODES.CREATED).send({
            message: `Currency ${value} created`
        });
    },
    delete: async (req: Request, res: Response) => {
        let { value } = req.body;
        value = value.toUpperCase();
    
        console.log(`DELETE - Currency ${value}`);
    
        const currencyRepository = getRepository(Currency);
        const currency = await currencyRepository.findOne(value);
    
        if (!currency) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        await currencyRepository.remove(currency);
    
        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `Currency ${value} successfully deleted`
        });
    }
}
