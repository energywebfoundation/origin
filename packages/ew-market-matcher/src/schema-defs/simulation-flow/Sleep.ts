export interface SleepAction {
    type: SleepActionType,
    data: SleepData
}

export enum SleepActionType {
    Sleep = "SLEEP"
}

export interface SleepData {
    ms: number
}