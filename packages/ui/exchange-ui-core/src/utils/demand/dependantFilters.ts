import { useTranslation } from 'react-i18next';
import { ICustomFilter, CustomFilterInputType, FilterRules } from '@energyweb/origin-ui-core';
import { TimeFrame } from '@energyweb/utils-general';

export function useDemandDependantFilters(): (filters: ICustomFilter[]) => ICustomFilter[] {
    const { t } = useTranslation();
    return (allFilters: ICustomFilter[]): ICustomFilter[] => {
        const periodFilter = allFilters.find(
            (filter) => filter.label === t('demand.properties.period')
        );
        const statusFilter = allFilters.find(
            (filter) => filter.label === t('demand.properties.status')
        );
        const startFilter = allFilters.find(
            (filter) => filter.label === t('demand.properties.start')
        );
        const endFilter = allFilters.find((filter) => filter.label === t('demand.properties.end'));

        if (
            periodFilter.selectedValue === TimeFrame.Daily ||
            periodFilter.selectedValue === TimeFrame.Weekly
        ) {
            startFilter.input = {
                type: CustomFilterInputType.day,
                filterRule: FilterRules.FROM
            };
            endFilter.input = {
                type: CustomFilterInputType.day,
                filterRule: FilterRules.TO
            };
        } else {
            startFilter.input = {
                type: CustomFilterInputType.yearMonth,
                filterRule: FilterRules.FROM
            };
            endFilter.input = {
                type: CustomFilterInputType.yearMonth,
                filterRule: FilterRules.TO
            };
        }
        return [periodFilter, statusFilter, startFilter, endFilter];
    };
}
