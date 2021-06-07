import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IPublicOrganization } from '@energyweb/origin-backend-core';
import { GetOrganizationsCommand, UserService } from '@energyweb/origin-backend';

import { Beneficiary } from '../beneficiary.entity';
import { BeneficiaryDTO } from '../dto/beneficiary.dto';
import { GetBeneficiariesCommand } from '../commands/get-beneficiaries.command';

@CommandHandler(GetBeneficiariesCommand)
export class GetBeneficiariesHandler implements ICommandHandler<GetBeneficiariesCommand> {
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly userService: UserService,
        private readonly commandBus: CommandBus
    ) {}

    public async execute({ organizationId }: GetBeneficiariesCommand): Promise<BeneficiaryDTO[]> {
        let orgId = organizationId;
        if (!organizationId) {
            const platformAdmin = await this.userService.getPlatformAdmin();
            orgId = platformAdmin.organization.id;
        }

        const beneficiaries = await this.repository.find({ ownerOrganizationId: orgId });

        const organizations: IPublicOrganization[] = await this.commandBus.execute(
            new GetOrganizationsCommand({ ids: beneficiaries.map((b) => b.organizationId) })
        );

        return beneficiaries.map((beneficiary) => {
            const organization = organizations.find((org) => org.id === beneficiary.organizationId);

            if (!organization) {
                return;
            }

            return BeneficiaryDTO.wrap({
                id: beneficiary.id,
                irecBeneficiaryId: beneficiary.irecBeneficiaryId,
                organization,
                ownerOrganizationId: beneficiary.ownerOrganizationId
            });
        });
    }
}
