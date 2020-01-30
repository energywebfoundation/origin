export enum DemandStatus {
    ACTIVE,
    PAUSED,
    ARCHIVED
}

export interface DemandPartiallyFilled {
    blockNumber: number;
    certificateId: string;
    energy: number;
}

export interface IDemandProperties {
    id: number;
    owner: string;
    status: DemandStatus;
    timeFrame: number;
    maxPriceInCentsPerMwh: number;
    currency: string;
    location?: string[];
    deviceType?: string[];
    otherGreenAttributes?: string;
    typeOfPublicSupport?: string;
    energyPerTimeFrame: number;
    registryCompliance?: string;
    startTime: number;
    endTime: number;
    procureFromSingleFacility?: boolean;
    vintage?: [number, number];
    automaticMatching: boolean;
}

export interface IDemand extends IDemandProperties {
    demandPartiallyFilledEvents: DemandPartiallyFilled[];
}

export type DemandPostData = Omit<IDemand, 'id' | 'status' | 'demandPartiallyFilledEvents'>;
export type DemandUpdateData = {
    status?: DemandStatus;
    demandPartiallyFilledEvent?: DemandPartiallyFilled;
};
