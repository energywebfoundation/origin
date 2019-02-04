export interface SetDateAction {
    type: SetDateActionType;
    data: DateData;
}

export enum SetDateActionType {
    SetDate = 'SET_DATE',
}

export interface DateData {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;  
}