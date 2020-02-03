import { Demand } from '@energyweb/market';
import { DeviceStatus } from '@energyweb/origin-backend-core';

export interface IPartiallyFilledDemand {
    demandId: number;
    certificateId: number;
    amount: number;
}

export interface ICertificateMatchesDemand {
    demandId: number;
    certificateId: string;
}

export interface IDeviceStatusChange {
    deviceId: string;
    status: DeviceStatus;
}

interface IUserTempStorage {
    userId: string;
    issuedCertificates: number;
    matchingCertificates: ICertificateMatchesDemand[];
    partiallyFilledDemands: IPartiallyFilledDemand[];
    fulfilledDemands: number[];
    deviceStatusChanges: IDeviceStatusChange[];
}

export interface IOriginEventsStore {
    getAllUsers(): string[];

    getIssuedCertificates(userId: string): number;
    getMatchingCertificates(userId: string): ICertificateMatchesDemand[];
    getPartiallyFilledDemands(userId: string): IPartiallyFilledDemand[];
    getFulfilledDemands(userId: string): number[];
    getDeviceStatusChanges(userId: string): IDeviceStatusChange[];

    registerIssuedCertificate(certOwnerId: string): void;
    registerMatchingCertificate(demand: Demand.Entity, certificateId: string): void;
    registerPartiallyFilledDemand(demandOwnerId: string, demand: IPartiallyFilledDemand): void;
    registerFulfilledDemand(demandOwnerId: string, demandId: number): void;
    registerDeviceStatusChange(
        deviceOwnerId: string,
        deviceId: string,
        deviceStatus: DeviceStatus
    ): void;

    resetIssuedCertificates(userId: string): void;
    resetMatchingCertificates(userId: string): void;
    resetPartiallyFilledDemands(userId: string): void;
    resetFulfilledDemands(userId: string): void;
    resetDeviceStatusChanges(userId: string): void;
}

export class OriginEventsStore implements IOriginEventsStore {
    private tempStorage: IUserTempStorage[];

    constructor() {
        this.tempStorage = [];
    }

    public registerIssuedCertificate(certOwnerId: string): void {
        const userStorage: IUserTempStorage = this.userStorage(certOwnerId);
        userStorage.issuedCertificates += 1;
    }

    public registerMatchingCertificate(demand: Demand.Entity, certificateId: string): void {
        const userStorage: IUserTempStorage = this.userStorage(demand.owner);

        userStorage.matchingCertificates.push({
            demandId: demand.id,
            certificateId
        });
    }

    public registerPartiallyFilledDemand(
        demandOwnerId: string,
        demand: IPartiallyFilledDemand
    ): void {
        const userStorage: IUserTempStorage = this.userStorage(demandOwnerId);
        userStorage.partiallyFilledDemands.push(demand);
    }

    public registerFulfilledDemand(demandOwnerId: string, demandId: number): void {
        const userStorage: IUserTempStorage = this.userStorage(demandOwnerId);
        userStorage.fulfilledDemands.push(demandId);
    }

    public registerDeviceStatusChange(
        deviceOwnerId: string,
        deviceId: string,
        deviceStatus: DeviceStatus
    ): void {
        const userStorage: IUserTempStorage = this.userStorage(deviceOwnerId);
        userStorage.deviceStatusChanges.push({
            deviceId,
            status: deviceStatus
        });
    }

    public getIssuedCertificates(userId: string): number {
        return this.userStorage(userId).issuedCertificates;
    }

    public getMatchingCertificates(userId: string): ICertificateMatchesDemand[] {
        return this.userStorage(userId).matchingCertificates;
    }

    public getPartiallyFilledDemands(userId: string): IPartiallyFilledDemand[] {
        return this.userStorage(userId).partiallyFilledDemands;
    }

    public getFulfilledDemands(userId: string): number[] {
        return this.userStorage(userId).fulfilledDemands;
    }

    public getDeviceStatusChanges(userId: string): IDeviceStatusChange[] {
        return this.userStorage(userId).deviceStatusChanges;
    }

    public getAllUsers(): string[] {
        return this.tempStorage.map(storage => storage.userId);
    }

    public resetIssuedCertificates(userId: string): void {
        this.userStorage(userId).issuedCertificates = 0;
    }

    public resetMatchingCertificates(userId: string): void {
        this.userStorage(userId).matchingCertificates = [];
    }

    public resetPartiallyFilledDemands(userId: string): void {
        this.userStorage(userId).partiallyFilledDemands = [];
    }

    public resetFulfilledDemands(userId: string): void {
        this.userStorage(userId).fulfilledDemands = [];
    }

    public resetDeviceStatusChanges(userId: string): void {
        this.userStorage(userId).deviceStatusChanges = [];
    }

    private initStorageForUser(userId: string): void {
        this.tempStorage.push({
            userId,
            issuedCertificates: 0,
            matchingCertificates: [],
            partiallyFilledDemands: [],
            fulfilledDemands: [],
            deviceStatusChanges: []
        });
    }

    private isUserInitialized(userId: string): boolean {
        return this.tempStorage.some(
            storage => storage.userId.toLowerCase() === userId.toLowerCase()
        );
    }

    private userStorage(userId: string): IUserTempStorage {
        if (!this.isUserInitialized(userId)) {
            this.initStorageForUser(userId);
        }

        return this.tempStorage.find(
            storage => storage.userId.toLowerCase() === userId.toLowerCase()
        );
    }
}
