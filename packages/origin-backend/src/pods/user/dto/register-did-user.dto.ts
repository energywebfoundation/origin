import { PickType } from '@nestjs/swagger';
import { UserDTO } from './user.dto';

export class RegisterDidUserDTO extends PickType(UserDTO, [
    'title',
    'firstName',
    'lastName',
    'email',
    'telephone'
] as const) {}
