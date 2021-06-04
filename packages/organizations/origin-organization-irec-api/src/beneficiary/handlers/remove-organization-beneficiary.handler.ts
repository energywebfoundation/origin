import { Repository } from 'typeorm';
import { CommandHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { RemoveOrganizationBeneficiaryCommand } from '../commands';
import { Beneficiary } from '../beneficiary.entity';

@CommandHandler(RemoveOrganizationBeneficiaryCommand)
export class RemoveOrganizationBeneficiaryHandler
    implements IEventHandler<RemoveOrganizationBeneficiaryCommand>
{
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>
    ) {}

    public async handle({
        id,
        ownerOrganizationId
    }: RemoveOrganizationBeneficiaryCommand): Promise<void> {
        await this.repository.delete({ id, ownerOrganizationId });
    }
}
