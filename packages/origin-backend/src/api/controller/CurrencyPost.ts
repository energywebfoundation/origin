import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { Currency } from "../../entity/Currency";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function currencyPostAction(req: Request, res: Response) {
    let { code } = req.params;
    code = code.toUpperCase();

    console.log(`POST - Currency: ${code}`);

    const currencyRepository = getRepository(Currency);
    const currencies: Currency[] = await currencyRepository.find();
    const currencyCodes: string[] = currencies.map(contract => contract.code);

    if (currencyCodes.includes(code)) {
        res.status(STATUS_CODES.CONFLICT).send({
            error: StorageErrors.ALREADY_EXISTS
        });

        return;
    }

    const newCurrency = new Currency();
    newCurrency.code = code.toUpperCase();

    await currencyRepository.save(newCurrency);

    res.status(STATUS_CODES.CREATED).send({
        message: `Currency ${code} created`
    });
}
