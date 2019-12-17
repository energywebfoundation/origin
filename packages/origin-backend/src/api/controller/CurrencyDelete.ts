import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { Currency } from "../../entity/Currency";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function currencyDeleteAction(req: Request, res: Response) {
    const { code } = req.params;

    console.log(`DELETE - Currency ${code}`);

    const currencyRepository = getRepository(Currency);
    const currency: Currency = await currencyRepository.findOne(
        code.toUpperCase()
    );

    if (!currency) {
        res.status(STATUS_CODES.NOT_FOUND).send({
            error: StorageErrors.NON_EXISTENT
        });

        return;
    }

    await currencyRepository.remove(currency);

    res.status(STATUS_CODES.NO_CONTENT).send({
        message: `Currency ${code} successfully deleted`
    });
}
