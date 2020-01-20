export interface IUser {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
}

export type UserRegisterData = Omit<IUser, 'id'>;
export type UserRegisterReturnData = Omit<IUser, 'password'>;

export type UserLoginData = Pick<IUser, 'email' | 'password'>;
export type UserLoginReturnData = { token: string };
