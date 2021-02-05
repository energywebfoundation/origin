import { DemandStatus } from '@energyweb/utils-general';

interface IDemandOption {
    label: string;
    value: DemandStatus;
}

export const configureStatus = (status: DemandStatus, translate: (string) => string): string => {
    switch (status) {
        case DemandStatus.ACTIVE:
            return translate('demand.properties.active');
        case DemandStatus.PAUSED:
            return translate('demand.properties.paused');
        case DemandStatus.ARCHIVED:
            return translate('demand.properties.archived');
    }
};

export const demandTypeOptions = (translate: (string) => string): IDemandOption[] => {
    return [
        {
            label: translate('demand.properties.active'),
            value: DemandStatus.ACTIVE
        },
        {
            label: translate('demand.properties.paused'),
            value: DemandStatus.PAUSED
        }
    ];
};
