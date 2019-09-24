import { Demand } from '@energyweb/market';

export interface IPartiallyFilledDemand {
    demandId: number;
    certificateId: number;
    amount: number;
}

interface IUserTempStorage {
    userId: string;
    newIssuedCertificates: number;
    newMatchingCertificates: number;
    newPartiallyFilledDemands: IPartiallyFilledDemand[];
}

export interface IOriginEventsStore {
    getAllUsers(): string[];

    getNewIssuedCertificates(userId: string): number;
    getNewMatchingCertificates(userId: string): number;
    getNewPartiallyFilledDemands(userId: string): IPartiallyFilledDemand[];

    registerNewIssuedCertificates(certOwnerId: string): void;
    registerNewMatchingCertificates(demand: Demand.Entity): void;
    registerNewPartiallyFilledDemand(demandOwnerId: string, demand: IPartiallyFilledDemand): void;

    resetNewIssuedCertificates(userId: string): void;
    resetNewMatchingCertificates(userId: string): void;
    resetNewPartiallyFilledDemands(userId: string): void;
}

export class OriginEventsStore implements IOriginEventsStore {
    private tempStorage: IUserTempStorage[];

    constructor() {
        this.tempStorage = [];
    }

    public registerNewIssuedCertificates(certOwnerId: string): void {
        let userStorage: IUserTempStorage = this.userStorage(certOwnerId);

        if (userStorage) {
            userStorage.newIssuedCertificates += 1;
        } else {
            userStorage = {
                userId: certOwnerId,
                newIssuedCertificates: 1,
                newMatchingCertificates: 0,
                newPartiallyFilledDemands: []
            };
            this.tempStorage.push(userStorage);
        }
    }

    public registerNewMatchingCertificates(demand: Demand.Entity): void {
        let userStorage: IUserTempStorage = this.userStorage(demand.demandOwner);

        if (userStorage) {
            userStorage.newMatchingCertificates += 1;
        } else {
            userStorage = {
                userId: demand.demandOwner,
                newIssuedCertificates: 0,
                newMatchingCertificates: 1,
                newPartiallyFilledDemands: []
            };
            this.tempStorage.push(userStorage);
        }
    }

    public registerNewPartiallyFilledDemand(
        demandOwner: string,
        demand: IPartiallyFilledDemand
    ): void {
        let userStorage: IUserTempStorage = this.userStorage(demandOwner);

        if (userStorage) {
            userStorage.newPartiallyFilledDemands.push(demand);
        } else {
            userStorage = {
                userId: demandOwner,
                newIssuedCertificates: 0,
                newMatchingCertificates: 0,
                newPartiallyFilledDemands: [demand]
            };
            this.tempStorage.push(userStorage);
        }
    }

    public getNewIssuedCertificates(userId: string): number {
        return this.userStorage(userId).newIssuedCertificates;
    }

    public getNewMatchingCertificates(userId: string): number {
        return this.userStorage(userId).newMatchingCertificates;
    }

    public getNewPartiallyFilledDemands(userId: string): IPartiallyFilledDemand[] {
        return this.userStorage(userId).newPartiallyFilledDemands;
    }

    public getAllUsers(): string[] {
        return this.tempStorage.map(storage => storage.userId);
    }

    public resetNewIssuedCertificates(userId: string): void {
        this.userStorage(userId).newIssuedCertificates = 0;
    }

    public resetNewMatchingCertificates(userId: string): void {
        this.userStorage(userId).newMatchingCertificates = 0;
    }

    public resetNewPartiallyFilledDemands(userId: string): void {
        this.userStorage(userId).newPartiallyFilledDemands = [];
    }

    private userStorage(userId: string): IUserTempStorage {
        return this.tempStorage.find(
            storage => storage.userId.toLowerCase() === userId.toLowerCase()
        );
    }
}
