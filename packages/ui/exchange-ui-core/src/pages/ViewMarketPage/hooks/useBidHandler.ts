import { IMarketFormValues } from '../../../components';
import { Dispatch } from 'redux';
import {
    EnergyFormatter,
    fromGeneralActions,
    fromGeneralSelectors
} from '@energyweb/origin-ui-core';
import { createBid, createDemand } from '../../../features';
import { ANY_OPERATOR, ANY_VALUE } from '../../../utils';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

type BidHandlerParams = {
    values: IMarketFormValues;
    oneTimePurchase: boolean;
    dispatch: Dispatch<any>;
    generationDateStart: string;
    country: string;
    generationDateEnd: string;
};

async function bidHandler({
    oneTimePurchase,
    values,
    dispatch,
    country,
    generationDateStart,
    generationDateEnd
}: BidHandlerParams) {
    dispatch(fromGeneralActions.setLoading(true));
    if (oneTimePurchase) {
        dispatch(
            createBid({
                price: parseFloat(values.price) * 100,
                product: {
                    deviceType: values.deviceType?.includes(ANY_VALUE)
                        ? undefined
                        : values.deviceType,
                    gridOperator: values.gridOperator?.includes(ANY_OPERATOR)
                        ? undefined
                        : values.gridOperator,
                    location: values.location?.includes(ANY_VALUE)
                        ? undefined
                        : values.location?.map((l) => `${country};${l}`),
                    generationFrom: generationDateStart,
                    generationTo: generationDateEnd
                },
                validFrom: moment().toISOString(),
                volume: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    parseFloat(values.energy)
                ).toString()
            })
        );
    } else {
        dispatch(
            createDemand({
                price: parseFloat(values.price) * 100,
                volumePerPeriod: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    parseFloat(values.demandVolume)
                ).toString(),
                periodTimeFrame: values.demandPeriod,
                start: values.demandDateStart.toISOString(),
                end: values.demandDateEnd.toISOString(),
                product: {
                    deviceType: values.deviceType?.includes(ANY_VALUE)
                        ? undefined
                        : values.deviceType,
                    gridOperator: values.gridOperator?.includes(ANY_OPERATOR)
                        ? undefined
                        : values.gridOperator,
                    location: values.location?.includes(ANY_VALUE)
                        ? undefined
                        : values.location?.map((l) => `${country};${l}`)
                },
                boundToGenerationTime: false,
                excludeEnd: false
            })
        );
    }
    dispatch(fromGeneralActions.setLoading(false));
}

export const useBidHandler = ({
    generationDateEnd,
    values,
    generationDateStart,
    oneTimePurchase
}: Pick<
    BidHandlerParams,
    'generationDateStart' | 'generationDateEnd' | 'oneTimePurchase' | 'values'
>) => {
    const dispatch = useDispatch();
    const country = useSelector(fromGeneralSelectors.getCountry);

    return useCallback(() => {
        bidHandler({
            dispatch,
            country,
            generationDateStart,
            generationDateEnd,
            oneTimePurchase,
            values
        });
    }, [country, generationDateStart, generationDateEnd, oneTimePurchase, values]);
};
