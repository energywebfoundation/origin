import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { GetOrganizationCommand } from '@energyweb/origin-backend';

import { Beneficiary } from '../beneficiary.entity';
import { GetBeneficiaryCommand } from '../commands/get-beneficiary.command';
import { IPublicBeneficiary } from '../dto/beneficiary.dto';

@CommandHandler(GetBeneficiaryCommand)
export class GetBeneficiaryHandler implements IEventHandler<GetBeneficiaryCommand> {
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly commandBus: CommandBus
    ) {}

    public async handle({ id }: GetBeneficiaryCommand): Promise<IPublicBeneficiary> {
        const beneficiary = await this.repository.findOne(id);

        if (!beneficiary) {
            return;
        }

        const organization = await this.commandBus.execute(new GetOrganizationCommand(String(id)));

        return {
            id: beneficiary.id,
            irecBeneficiaryId: beneficiary.irecBeneficiaryId,
            organization,
            active: beneficiary.active
        };
    }
}
