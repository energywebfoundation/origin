import { PickType } from '@nestjs/swagger';
import { UserDTO } from './user.dto';

export class UpdateOwnUserSettingsDTO extends PickType(UserDTO, ['notifications'] as const) {}
