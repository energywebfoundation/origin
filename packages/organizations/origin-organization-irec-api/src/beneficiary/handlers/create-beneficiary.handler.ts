import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@energyweb/origin-backend';

import { IrecService } from '../../irec';
import { CreateBeneficiaryCommand } from '../commands/create-beneficiary.command';
import { Beneficiary } from '../beneficiary.entity';
import { BeneficiaryDTO } from '../dto/beneficiary.dto';
import { GetBeneficiaryCommand } from '../commands';

@CommandHandler(CreateBeneficiaryCommand)
export class CreateBeneficiaryHandler implements IEventHandler<CreateBeneficiaryCommand> {
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly userService: UserService,
        private readonly irecService: IrecService,
        private readonly commandBus: CommandBus
    ) {}

    public async handle({ organization }: CreateBeneficiaryCommand): Promise<BeneficiaryDTO> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        const irecBeneficiary = await this.irecService.createBeneficiary(
            platformAdmin.id,
            organization
        );

        const beneficiary = this.repository.create({
            irecBeneficiaryId: irecBeneficiary.id,
            organizationId: organization.id,
            ownerOrganizationId: platformAdmin.organization.id,
            active: true
        });

        const storedBeneficiary = await this.repository.save(beneficiary);

        return this.commandBus.execute(new GetBeneficiaryCommand(storedBeneficiary.id));
    }
}
