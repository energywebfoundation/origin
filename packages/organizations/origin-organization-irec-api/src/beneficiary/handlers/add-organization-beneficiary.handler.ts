import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { AddOrganizationBeneficiaryCommand, GetBeneficiaryCommand } from '../commands';
import { Beneficiary } from '../beneficiary.entity';
import { NotFoundException } from '@nestjs/common';
import { BeneficiaryDTO } from '../dto/beneficiary.dto';

@CommandHandler(AddOrganizationBeneficiaryCommand)
export class AddOrganizationBeneficiaryHandler
    implements ICommandHandler<AddOrganizationBeneficiaryCommand>
{
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly commandBus: CommandBus
    ) {}

    public async execute({
        ownerId,
        irecBeneficiaryId
    }: AddOrganizationBeneficiaryCommand): Promise<BeneficiaryDTO> {
        const beneficiary = await this.repository.findOne({
            ownerId: null,
            irecBeneficiaryId
        });

        if (!beneficiary) {
            throw new NotFoundException('Beneficiary not found');
        }

        const newBeneficiary = this.repository.create({
            irecBeneficiaryId: beneficiary.irecBeneficiaryId,
            organizationId: beneficiary.organizationId,
            ownerId: ownerId
        });

        const storedBeneficiary = await this.repository.save(newBeneficiary);

        return this.commandBus.execute(new GetBeneficiaryCommand(storedBeneficiary.id));
    }
}
