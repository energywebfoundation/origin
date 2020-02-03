import { Demand } from '@energyweb/market';
import {
    DeviceStatus,
    DeviceStatusChanged,
    DemandPartiallyFilledEvent,
    OrganizationStatusChanged,
    OrganizationInvitationEvent,
    OrganizationRemovedMember
} from '@energyweb/origin-backend-core';

export interface ICertificateMatchesDemand {
    demandId: number;
    certificateId: string;
}

interface IUserTempStorage {
    userId: string;
    issuedCertificates: number;
    matchingCertificates: ICertificateMatchesDemand[];
    partiallyFilledDemands: DemandPartiallyFilledEvent[];
    fulfilledDemands: number[];
    deviceStatusChanges: DeviceStatusChanged[];
    organizationStatusChanges: OrganizationStatusChanged[];
    organizationInvitations: OrganizationInvitationEvent[];
    organizationRemovedMembers: OrganizationRemovedMember[];
}

export interface IOriginEventsStore {
    getAllUsers(): string[];

    getIssuedCertificates(userId: string): number;
    getMatchingCertificates(userId: string): ICertificateMatchesDemand[];
    getPartiallyFilledDemands(userId: string): DemandPartiallyFilledEvent[];
    getFulfilledDemands(userId: string): number[];
    getDeviceStatusChanges(userId: string): DeviceStatusChanged[];
    getOrganizationStatusChanges(organizationEmail: string): OrganizationStatusChanged[];
    getOrganizationInvitations(userEmail: string): OrganizationInvitationEvent[];
    getOrganizationRemovedMember(userEmail: string): OrganizationRemovedMember[];

    registerIssuedCertificate(certOwnerId: string): void;
    registerMatchingCertificate(demand: Demand.Entity, certificateId: string): void;
    registerPartiallyFilledDemand(demandOwnerId: string, demand: DemandPartiallyFilledEvent): void;
    registerFulfilledDemand(demandOwnerId: string, demandId: number): void;
    registerDeviceStatusChange(
        deviceOwnerId: string,
        deviceId: string,
        deviceStatus: DeviceStatus
    ): void;
    registerOrganizationStatusChange(
        organizationEmail: string,
        event: OrganizationStatusChanged
    ): void;
    registerOrganizationInvitation(userEmail: string, event: OrganizationInvitationEvent): void;
    registerOrganizationRemovedMember(userEmail: string, event: OrganizationRemovedMember): void;

    resetIssuedCertificates(userId: string): void;
    resetMatchingCertificates(userId: string): void;
    resetPartiallyFilledDemands(userId: string): void;
    resetFulfilledDemands(userId: string): void;
    resetDeviceStatusChanges(userId: string): void;
    resetOrganizationStatusChanges(organizationEmail: string): void;
    resetOrganizationInvitations(userEmail: string): void;
    resetOrganizationRemovedMembers(userEmail: string): void;
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
        demand: DemandPartiallyFilledEvent
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

    public registerOrganizationStatusChange(
        organizationEmail: string,
        event: OrganizationStatusChanged
    ): void {
        const userStorage: IUserTempStorage = this.userStorage(organizationEmail);
        userStorage.organizationStatusChanges.push(event);
    }

    public registerOrganizationInvitation(
        userEmail: string,
        event: OrganizationInvitationEvent
    ): void {
        const userStorage: IUserTempStorage = this.userStorage(userEmail);
        userStorage.organizationInvitations.push(event);
    }

    public registerOrganizationRemovedMember(
        userEmail: string,
        event: OrganizationRemovedMember
    ): void {
        const userStorage: IUserTempStorage = this.userStorage(userEmail);
        userStorage.organizationRemovedMembers.push(event);
    }

    public getIssuedCertificates(userId: string): number {
        return this.userStorage(userId).issuedCertificates;
    }

    public getMatchingCertificates(userId: string): ICertificateMatchesDemand[] {
        return this.userStorage(userId).matchingCertificates;
    }

    public getPartiallyFilledDemands(userId: string): DemandPartiallyFilledEvent[] {
        return this.userStorage(userId).partiallyFilledDemands;
    }

    public getFulfilledDemands(userId: string): number[] {
        return this.userStorage(userId).fulfilledDemands;
    }

    public getDeviceStatusChanges(userId: string): DeviceStatusChanged[] {
        return this.userStorage(userId).deviceStatusChanges;
    }

    public getOrganizationStatusChanges(organizationEmail: string): OrganizationStatusChanged[] {
        return this.userStorage(organizationEmail).organizationStatusChanges;
    }

    public getOrganizationInvitations(userEmail: string): OrganizationInvitationEvent[] {
        return this.userStorage(userEmail).organizationInvitations;
    }

    public getOrganizationRemovedMember(userEmail: string): OrganizationRemovedMember[] {
        return this.userStorage(userEmail).organizationRemovedMembers;
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

    public resetOrganizationStatusChanges(userId: string): void {
        this.userStorage(userId).organizationStatusChanges = [];
    }

    public resetOrganizationInvitations(userEmail: string): void {
        this.userStorage(userEmail).organizationInvitations = [];
    }

    public resetOrganizationRemovedMembers(userEmail: string): void {
        this.userStorage(userEmail).organizationRemovedMembers = [];
    }

    private initStorageForUser(userId: string): void {
        this.tempStorage.push({
            userId,
            issuedCertificates: 0,
            matchingCertificates: [],
            partiallyFilledDemands: [],
            fulfilledDemands: [],
            deviceStatusChanges: [],
            organizationStatusChanges: [],
            organizationInvitations: [],
            organizationRemovedMembers: []
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
