import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Currency } from "../../entity/Currency";

export async function currencyGetAction(req: Request, res: Response) {
    console.log(`GET - Currency`);
    const currencyRepository = getRepository(Currency);

    const contracts: Currency[] = await currencyRepository.find();

    res.send(
        contracts.map(contract => contract.code)
    );
}
