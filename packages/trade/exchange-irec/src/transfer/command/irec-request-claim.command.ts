import { ICommand } from '@nestjs/cqrs';
import { IrecRequestClaimDTO } from '../dto';

export class IrecRequestClaimCommand implements ICommand {
  constructor (
    public userId: string,
    public claim: IrecRequestClaimDTO,
  ) {}
}
