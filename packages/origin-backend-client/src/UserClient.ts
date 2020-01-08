import axios from 'axios';
import {
    UserRegisterReturnData,
    UserRegisterData,
    UserLoginData,
    UserLoginReturnData
} from '@energyweb/origin-backend-core';

export interface IUserClient {
    login(data: UserLoginData): Promise<UserLoginReturnData>;
    register(data: UserRegisterData): Promise<UserRegisterReturnData>;
}

export class UserClient implements IUserClient {
    private baseURL: string;

    constructor(_baseUrl: string) {
        this.baseURL = _baseUrl;
    }

    private get endpoint() {
        return `${this.baseURL}/User`;
    }

    public async register(formData: UserRegisterData): Promise<UserRegisterReturnData> {
        const url = `${this.endpoint}/register`;
        const { data } = await axios.post(url, formData);

        return data;
    }

    public async login(formData: UserLoginData): Promise<UserLoginReturnData> {
        const url = `${this.endpoint}/login`;
        const { data } = await axios.post(url, formData);

        return data;
    }
}
