import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { UserService } from '@energyweb/origin-backend';

import { IREC_SERVICE, IrecService } from '../../irec';
import { Beneficiary } from '../beneficiary.entity';
import { CreateOrganizationBeneficiaryCommand, GetBeneficiaryCommand } from '../commands';
import { BeneficiaryDTO } from '../dto';

@CommandHandler(CreateOrganizationBeneficiaryCommand)
export class CreateOrganizationBeneficiaryHandler
    implements ICommandHandler<CreateOrganizationBeneficiaryCommand>
{
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly userService: UserService,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly commandBus: CommandBus
    ) {}

    public async execute({
        organization
    }: CreateOrganizationBeneficiaryCommand): Promise<BeneficiaryDTO> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        const irecBeneficiary = await this.irecService.createBeneficiary(platformAdmin.id, {
            name: organization.name,
            countryCode: organization.country,
            location: `${organization.city}. ${organization.address}`
        });

        const beneficiary = this.repository.create({
            irecBeneficiaryId: irecBeneficiary.id,
            organizationId: organization.id,
            ownerId: null
        });

        const storedBeneficiary = await this.repository.save(beneficiary);

        return this.commandBus.execute(new GetBeneficiaryCommand(storedBeneficiary.id));
    }
}
