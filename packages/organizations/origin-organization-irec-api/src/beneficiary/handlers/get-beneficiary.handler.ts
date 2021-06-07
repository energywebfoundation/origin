import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { GetOrganizationCommand, Organization } from '@energyweb/origin-backend';

import { Beneficiary } from '../beneficiary.entity';
import { GetBeneficiaryCommand } from '../commands/get-beneficiary.command';
import { BeneficiaryDTO } from '../dto/beneficiary.dto';

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

        const organization: Organization = await this.commandBus.execute(
            new GetOrganizationCommand(String(beneficiary.ownerOrganizationId))
        );

        return BeneficiaryDTO.wrap({
            id: beneficiary.id,
            irecBeneficiaryId: beneficiary.irecBeneficiaryId,
            organization,
            ownerOrganizationId: beneficiary.ownerOrganizationId
        });
    }
}
