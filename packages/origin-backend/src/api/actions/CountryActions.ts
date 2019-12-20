import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { Country } from "../../entity/Country";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

import { IActions } from './IActions';

export const CountryActions: IActions = {
    get: async (req: Request, res: Response) => {    
        console.log(`GET - Country`);
        const countryRepository = getRepository(Country);
        const [ country ] = await countryRepository.find();
    
        if (!country) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        res.send({
            name: country.name,
            regions: JSON.parse(country.regions)
        });
    },
    post: async (req: Request, res: Response) => {
        const { value } = req.body;
        const newName = value.name;
        const newRegions = JSON.stringify(value.regions);
    
        console.log(`POST - Country: ${value}`);
    
        const countryRepository = getRepository(Country);
        const country = await countryRepository.find();

        if (country.length > 0) {
            const currentCountry = country[0];

            if (newName === currentCountry.name && newRegions === currentCountry.regions) {
                res.status(STATUS_CODES.SUCCESS).send({
                    message: StorageErrors.ALREADY_EXISTS
                });

                return;
            }

            // Override the current set standard
            await countryRepository.remove(currentCountry);
        }
    
        const newCountry = new Country();
    
        newCountry.name = newName;
        newCountry.regions = newRegions;
    
        await countryRepository.save(newCountry);
    
        res.status(STATUS_CODES.CREATED).send({
            message: `Country ${newName} created`
        });
    },
    delete: async (req: Request, res: Response) => {
        console.log(`DELETE - Country`);
    
        const countryRepository = getRepository(Country);
        const [ country ] = await countryRepository.find();
    
        if (!country) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        await countryRepository.remove(country);
    
        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `Compliance ${country.name} successfully deleted`
        });
    }
}
