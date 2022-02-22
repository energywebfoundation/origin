import { ICommand } from '@nestjs/cqrs';
import { IRequestClaimData } from '../transfer.service';

export class RequestClaimCommand implements ICommand {
    constructor(public userId: string, public claimData: IRequestClaimData) {}
}
