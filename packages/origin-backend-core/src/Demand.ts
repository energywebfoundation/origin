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

export interface IDemand {
    id: number;
    owner: string;
    status: DemandStatus;
    timeFrame: number;
    maxPriceInCentsPerMwh: number;
    currency: string;
    location?: string[];
    deviceType?: string[];
    minCO2Offset?: number;
    otherGreenAttributes?: string;
    typeOfPublicSupport?: string;
    energyPerTimeFrame: number;
    registryCompliance?: string;
    startTime: number;
    endTime: number;
    procureFromSingleFacility?: boolean;
    vintage?: [number, number];
    automaticMatching: boolean;
    demandPartiallyFilledEvents: DemandPartiallyFilled[]
}

export type DemandPostData = Omit<IDemand, 'id' | 'status' | 'demandPartiallyFilledEvents'>;
export type DemandUpdateData = {
    status?: DemandStatus;
    demandPartiallyFilledEvent?: DemandPartiallyFilled
};
