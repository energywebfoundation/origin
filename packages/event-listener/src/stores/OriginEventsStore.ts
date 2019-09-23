import { User } from '@energyweb/user-registry';

interface IPartiallyFilledDemand {
    demandId: number;
    certificateId: number;
    amount: number;
}

interface IUserTempStorage {
    user: User.Entity;
    newIssuedCertificates: number;
    newMatchingCertificates: number;
    newPartiallyFilledDemands: IPartiallyFilledDemand[];
}

export interface IOriginEventsStore {
    getAllUsers(): User.Entity[];

    getNewIssuedCertificates(user: User.Entity): number;
    getNewMatchingCertificates(user: User.Entity): number;
    getNewPartiallyFilledDemands(user: User.Entity): IPartiallyFilledDemand[];

    incrementNewIssuedCertificates(certOwner: User.Entity): void;
    incrementNewMatchingCertificates(demandOwner: User.Entity): void;
    addNewPartiallyFilledDemand(demandOwner: User.Entity, demand: IPartiallyFilledDemand): void;

    resetNewIssuedCertificates(user: User.Entity): void;
    resetNewMatchingCertificates(user: User.Entity): void;
    resetNewPartiallyFilledDemands(user: User.Entity): void;
}

export class OriginEventsStore implements IOriginEventsStore {
    private tempStorage: IUserTempStorage[];

    constructor() {
        this.tempStorage = [];
    }

    public getNewIssuedCertificates(user: User.Entity): number {
        return this.userStorage(user).newIssuedCertificates;
    }

    public getNewMatchingCertificates(user: User.Entity): number {
        return this.userStorage(user).newMatchingCertificates;
    }

    public getNewPartiallyFilledDemands(user: User.Entity): IPartiallyFilledDemand[] {
        return this.userStorage(user).newPartiallyFilledDemands;
    }

    public incrementNewIssuedCertificates(certOwner: User.Entity): void {
        let userStorage: IUserTempStorage = this.userStorage(certOwner);

        if (userStorage) {
            userStorage.newIssuedCertificates += 1;
        } else {
            userStorage = {
                user: certOwner,
                newIssuedCertificates: 1,
                newMatchingCertificates: 0,
                newPartiallyFilledDemands: []
            };
            this.tempStorage.push(userStorage);
        }
    }

    public incrementNewMatchingCertificates(demandOwner: User.Entity): void {
        let userStorage: IUserTempStorage = this.userStorage(demandOwner);

        if (userStorage) {
            userStorage.newMatchingCertificates += 1;
        } else {
            userStorage = {
                user: demandOwner,
                newIssuedCertificates: 0,
                newMatchingCertificates: 1,
                newPartiallyFilledDemands: []
            };
            this.tempStorage.push(userStorage);
        }
    }

    public addNewPartiallyFilledDemand(
        demandOwner: User.Entity,
        demand: IPartiallyFilledDemand
    ): void {
        let userStorage: IUserTempStorage = this.userStorage(demandOwner);

        if (userStorage) {
            userStorage.newPartiallyFilledDemands.push(demand);
        } else {
            userStorage = {
                user: demandOwner,
                newIssuedCertificates: 0,
                newMatchingCertificates: 0,
                newPartiallyFilledDemands: [demand]
            };
            this.tempStorage.push(userStorage);
        }
    }

    public getAllUsers(): User.Entity[] {
        return this.tempStorage.map(storage => storage.user);
    }

    public resetNewIssuedCertificates(user: User.Entity): void {
        this.userStorage(user).newIssuedCertificates = 0;
    }

    public resetNewMatchingCertificates(user: User.Entity): void {
        this.userStorage(user).newMatchingCertificates = 0;
    }

    public resetNewPartiallyFilledDemands(user: User.Entity): void {
        this.userStorage(user).newPartiallyFilledDemands = [];
    }

    private userStorage(user: User.Entity): IUserTempStorage {
        return this.tempStorage.find(storage => storage.user.id === user.id);
    }
}
