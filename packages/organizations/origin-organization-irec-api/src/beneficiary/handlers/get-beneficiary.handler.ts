import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { GetOrganizationCommand } from '@energyweb/origin-backend';

import { Beneficiary } from '../beneficiary.entity';
import { GetBeneficiaryCommand } from '../commands';
import { BeneficiaryDTO } from '../dto';

@CommandHandler(GetBeneficiaryCommand)
export class GetBeneficiaryHandler implements ICommandHandler<GetBeneficiaryCommand> {
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly commandBus: CommandBus
    ) {}

    public async execute({ id }: GetBeneficiaryCommand): Promise<BeneficiaryDTO> {
        const beneficiary = await this.repository.findOne(id);

        if (!beneficiary) {
            return;
        }

        return BeneficiaryDTO.wrap({
            ...beneficiary,
            organization: beneficiary.organizationId
                ? await this.commandBus.execute(
                      new GetOrganizationCommand(String(beneficiary.ownerId))
                  )
                : null
        });
    }
}
