import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { IActions } from './IActions';

import { Compliance } from "../../entity/Compliance";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export const ComplianceActions: IActions = {
    get: async (req: Request, res: Response) => {
        console.log(`GET - Compliance`);
        const complianceRepository = getRepository(Compliance);
        const [ compliance ] = await complianceRepository.find();
    
        if (!compliance) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        res.send(compliance.standard);
    },
    post: async (req: Request, res: Response) => {
        const { value } = req.body;
    
        console.log(`POST - Compliance: ${value}`);
    
        const complianceRepository = getRepository(Compliance);
        const compliances = await complianceRepository.find();

        if (compliances.length > 0) {
            const currentCompliance = compliances[0];

            if (value === currentCompliance.standard) {
                res.status(STATUS_CODES.SUCCESS).send({
                    message: StorageErrors.ALREADY_EXISTS
                });

                return;
            }

            // Override the current set standard
            await complianceRepository.remove(currentCompliance);
        }
    
        const newCompliance = new Compliance();
        newCompliance.standard = value;
    
        await complianceRepository.save(newCompliance);
    
        res.status(STATUS_CODES.CREATED).send({
            message: `Compliance ${value} created`
        });
    },
    delete: async (req: Request, res: Response) => {
        console.log(`DELETE - Compliance`);
    
        const complianceRepository = getRepository(Compliance);
        const [ compliance ] = await complianceRepository.find();
    
        if (!compliance) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        await complianceRepository.remove(compliance);
    
        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `Compliance ${compliance.standard} successfully deleted`
        });
    }
}
