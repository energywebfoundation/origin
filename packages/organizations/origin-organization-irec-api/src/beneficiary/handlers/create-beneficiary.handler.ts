import { Repository } from 'typeorm';
import { CommandHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@energyweb/origin-backend';

import { IrecService } from '../../irec';
import { CreateBeneficiaryCommand } from '../commands';
import { Beneficiary } from '../beneficiary.entity';

@CommandHandler(CreateBeneficiaryCommand)
export class CreateBeneficiaryHandler implements IEventHandler<CreateBeneficiaryCommand> {
    constructor(
        private readonly userService: UserService,
        private readonly irecService: IrecService,
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>
    ) {}

    public async handle({ organization }: CreateBeneficiaryCommand): Promise<Beneficiary> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        const irecBeneficiary = await this.irecService.createBeneficiary(
            platformAdmin.id,
            organization
        );

        const beneficiary = this.repository.create({
            irecBeneficiaryId: irecBeneficiary.id,
            organizationId: organization.id,
            active: true
        });

        return this.repository.save(beneficiary);
    }
}
