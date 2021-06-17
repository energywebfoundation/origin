import { Repository } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { RemoveOrganizationBeneficiaryCommand } from '../commands';
import { Beneficiary } from '../beneficiary.entity';

@CommandHandler(RemoveOrganizationBeneficiaryCommand)
export class RemoveOrganizationBeneficiaryHandler
    implements ICommandHandler<RemoveOrganizationBeneficiaryCommand>
{
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>
    ) {}

    public async execute({ id, ownerId }: RemoveOrganizationBeneficiaryCommand): Promise<void> {
        await this.repository.delete({ id, ownerId });
    }
}
