export interface SleepAction {
    type: SleepActionType;
    data: SleepData;
}

export enum SleepActionType {
    Sleep = 'SLEE',
}

export interface SleepData {
    ms: number;
}