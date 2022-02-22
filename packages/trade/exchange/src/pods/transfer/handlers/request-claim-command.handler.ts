import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferService } from '../transfer.service';
import { ensureSingleProcessOnly } from '../../../utils/ensureSingleProcessOnly';
import { RequestClaimCommand } from '../commands';
import { BeingProcessedError } from '../errors/being-processed.error';
import { TransferDirection } from '../transfer-direction';

@CommandHandler(RequestClaimCommand)
export class RequestClaimCommandHandler implements ICommandHandler<RequestClaimCommand> {
    constructor(private transferService: TransferService) {}

    async execute(command: RequestClaimCommand): Promise<any> {
        const result = await ensureSingleProcessOnly(
            command.userId,
            'requestClaim',
            () => this.transferService.requestClaim(command.userId, command.claimData),
            new BeingProcessedError(TransferDirection.Claim)
        );

        return result;
    }
}
