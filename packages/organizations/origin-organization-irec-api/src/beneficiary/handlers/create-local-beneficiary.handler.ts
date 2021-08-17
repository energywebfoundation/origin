import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { UserService } from '@energyweb/origin-backend';

import { IREC_SERVICE, IrecService } from '../../irec';
import { Beneficiary } from '../beneficiary.entity';
import { CreateLocalBeneficiaryCommand, GetBeneficiaryCommand } from '../commands';
import { BeneficiaryDTO } from '../dto';

@CommandHandler(CreateLocalBeneficiaryCommand)
export class CreateLocalBeneficiaryHandler
    implements ICommandHandler<CreateLocalBeneficiaryCommand>
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
        organizationId,
        beneficiary
    }: CreateLocalBeneficiaryCommand): Promise<BeneficiaryDTO> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        const irecBeneficiary = await this.irecService.createBeneficiary(
            platformAdmin.organization.id,
            beneficiary
        );

        const newBeneficiary = this.repository.create({
            irecBeneficiaryId: irecBeneficiary.id,
            organizationId: null,
            ownerId: organizationId,
            name: beneficiary.name,
            countryCode: beneficiary.countryCode,
            location: beneficiary.location,
            active: true
        });

        const storedBeneficiary = await this.repository.save(newBeneficiary);

        return this.commandBus.execute(new GetBeneficiaryCommand(storedBeneficiary.id));
    }
}
