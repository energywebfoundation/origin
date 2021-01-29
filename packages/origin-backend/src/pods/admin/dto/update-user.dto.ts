import { PickType } from '@nestjs/swagger';
import { UserDTO } from '../../user/dto/user.dto';

export class UpdateUserDTO extends PickType(UserDTO, [
    'title',
    'firstName',
    'lastName',
    'email',
    'telephone',
    'status',
    'kycStatus'
] as const) {}
