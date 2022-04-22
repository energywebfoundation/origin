import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IrecRequestClaimCommand } from '../command';
import { ForbiddenException, Inject } from '@nestjs/common';
import { AccountBalanceService, RequestClaimCommand } from '@energyweb/exchange';
import { IrecService, IREC_SERVICE } from '@energyweb/origin-organization-irec-api';
import { Connection, Repository } from 'typeorm';
import { UserService } from '@energyweb/origin-backend';
import { InjectRepository } from '@nestjs/typeorm';
import { IrecTradeTransfer } from '../irec-trade-transfer.entity';

@CommandHandler(IrecRequestClaimCommand)
export class IrecRequestClaimHandler implements ICommandHandler<IrecRequestClaimCommand> {
    constructor(
        private commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private irecService: IrecService,
        private accountBalanceService: AccountBalanceService,
        private connection: Connection,
        private userService: UserService,
        @InjectRepository(IrecTradeTransfer)
        private repository: Repository<IrecTradeTransfer>
    ) {}

    public async execute({ userId, claim }: IrecRequestClaimCommand): Promise<void> {
        const availableAssets = await this.accountBalanceService.getAccountBalance(userId);

        if (availableAssets.available.every((a) => a.asset.id !== claim.assetId)) {
            throw new ForbiddenException(`Cannot claim ${claim.assetId} due to lacking permission`);
        }

        /**
         * @NOTE this is not the best solution.
         *
         * I was not able to unwind dependencies between issuer, issuer-api and exchange packages
         * to make this working.
         * So ideally, each required module would export a method for retrieving relevant item by given field.
         * However now, packages communicate via commands and events, and are all connected in origin-backend-irec-app.
         *
         * I could add methods to each dependency package, and import a dependency here, but I'm not sure about scope
         * of this and another package. I don't know how to do it better. I don't know Origin that well.
         *
         * Hopefully tests will ensure, that this code won't break unexpectedly.
         *
         * Mateusz Koteja, 11.03.2022
         */
        const [irec_issuer_certification_request] = await this.connection.query(`
      select iicr.*, ea."tokenId" from exchange_asset ea
      inner join issuer_certification_request icr on ea."tokenId"::int4 = icr."issuedCertificateId"
      inner join irec_issuer_certification_request iicr on iicr."certificationRequestId"  = icr.id
      where ea.id = '${claim.assetId.toString()}'
    `);

        const platformAdmin = await this.userService.getPlatformAdmin();

        if (!irec_issuer_certification_request) {
            throw new Error(
                `Cannot find issuer certification request (or issuer_certificate) for asset ${claim.assetId}`
            );
        }

        const irecResult = await this.irecService.redeem(
            platformAdmin.id,
            irec_issuer_certification_request.irecAssetId,
            {
                beneficiary: String(claim.beneficiary.irecId),
                countryCode: claim.beneficiary.countryCode,
                location: claim.beneficiary.location,
                periodEndDate: claim.periodEndDate,
                periodStartDate: claim.periodStartDate,
                purpose: claim.purpose,
                amount: claim.amount
            }
        );

        const irecItem = Object.values(irecResult.items)[0];

        await this.repository.insert({
            tokenId: irec_issuer_certification_request.tokenId,
            verificationKey: irecResult.verificationKey
        });

        await this.commandBus.execute(
            new RequestClaimCommand(userId, {
                ...claim,
                claimData: {
                    beneficiary: claim.beneficiary.name,
                    countryCode: claim.beneficiary.countryCode,
                    location: claim.beneficiary.location,
                    periodEndDate: claim.periodEndDate,
                    periodStartDate: claim.periodStartDate,
                    purpose: claim.purpose,
                    irecVerificationUrl: irecResult.verificationUrl,
                    irecStartCertNum: irecItem.start_cert_num,
                    irecEndCertNum: irecItem.end_cert_num
                }
            })
        );
    }
}
