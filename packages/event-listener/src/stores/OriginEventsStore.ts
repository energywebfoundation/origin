import { Demand } from '@energyweb/market';

export interface IPartiallyFilledDemand {
    demandId: number;
    certificateId: number;
    amount: number;
}

export interface ICertificateMatchesDemand {
    demandId: string;
    certificateId: string;
}

interface IUserTempStorage {
    userId: string;
    newIssuedCertificates: number;
    newMatchingCertificates: ICertificateMatchesDemand[];
    newPartiallyFilledDemands: IPartiallyFilledDemand[];
}

export interface IOriginEventsStore {
    getAllUsers(): string[];

    getNewIssuedCertificates(userId: string): number;
    getNewMatchingCertificates(userId: string): ICertificateMatchesDemand[];
    getNewPartiallyFilledDemands(userId: string): IPartiallyFilledDemand[];

    registerNewIssuedCertificates(certOwnerId: string): void;
    registerNewMatchingCertificates(demand: Demand.Entity, certificateId: string): void;
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
        const userStorage: IUserTempStorage = this.userStorage(certOwnerId);

        if (!userStorage) {
            this.tempStorage.push({
                userId: certOwnerId,
                newIssuedCertificates: 1,
                newMatchingCertificates: [],
                newPartiallyFilledDemands: []
            });
            return;
        }

        userStorage.newIssuedCertificates += 1;
    }

    public registerNewMatchingCertificates(demand: Demand.Entity, certificateId: string): void {
        const userStorage: IUserTempStorage = this.userStorage(demand.demandOwner);

        const entry: ICertificateMatchesDemand = {
            demandId: demand.id,
            certificateId
        };

        if (!userStorage) {
            this.tempStorage.push({
                userId: demand.demandOwner,
                newIssuedCertificates: 0,
                newMatchingCertificates: [entry],
                newPartiallyFilledDemands: []
            });
            return;
        }

        userStorage.newMatchingCertificates.push(entry);
    }

    public registerNewPartiallyFilledDemand(
        demandOwner: string,
        demand: IPartiallyFilledDemand
    ): void {
        const userStorage: IUserTempStorage = this.userStorage(demandOwner);

        if (!userStorage) {
            this.tempStorage.push({
                userId: demandOwner,
                newIssuedCertificates: 0,
                newMatchingCertificates: [],
                newPartiallyFilledDemands: [demand]
            });
            return;
        }

        userStorage.newPartiallyFilledDemands.push(demand);
    }

    public getNewIssuedCertificates(userId: string): number {
        return this.userStorage(userId).newIssuedCertificates;
    }

    public getNewMatchingCertificates(userId: string): ICertificateMatchesDemand[] {
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
        this.userStorage(userId).newMatchingCertificates = [];
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
