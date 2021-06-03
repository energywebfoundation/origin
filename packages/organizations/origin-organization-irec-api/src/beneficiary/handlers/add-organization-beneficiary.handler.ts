import { Repository } from 'typeorm';
import { CommandBus, CommandHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@energyweb/origin-backend';

import { AddOrganizationBeneficiaryCommand, GetBeneficiaryCommand } from '../commands';
import { Beneficiary } from '../beneficiary.entity';
import { NotFoundException } from '@nestjs/common';
import { IPublicBeneficiary } from '../dto/beneficiary.dto';

@CommandHandler(AddOrganizationBeneficiaryCommand)
export class AddOrganizationBeneficiaryHandler
    implements IEventHandler<AddOrganizationBeneficiaryCommand>
{
    constructor(
        @InjectRepository(Beneficiary)
        private readonly repository: Repository<Beneficiary>,
        private readonly userService: UserService,
        private readonly commandBus: CommandBus
    ) {}

    public async handle({
        ownerOrganizationId,
        irecBeneficiaryId
    }: AddOrganizationBeneficiaryCommand): Promise<IPublicBeneficiary> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        const beneficiary = await this.repository.findOne({
            ownerOrganizationId: platformAdmin.organization.id,
            irecBeneficiaryId
        });

        if (!beneficiary) {
            throw new NotFoundException('Beneficiary not found');
        }

        const newBeneficiary = this.repository.create({
            irecBeneficiaryId: beneficiary.irecBeneficiaryId,
            organizationId: beneficiary.organizationId,
            ownerOrganizationId: platformAdmin.organization.id,
            active: true
        });

        const storedBeneficiary = await this.repository.save(newBeneficiary);

        return this.commandBus.execute(new GetBeneficiaryCommand(storedBeneficiary.id));
    }
}
