import { useSelector } from 'react-redux';
import { fromGeneralSelectors } from '@energyweb/origin-ui-core';

export const useDefaultCurrency = () => {
    const currencies = useSelector(fromGeneralSelectors.getCurrencies);
    return currencies?.[0] ?? 'USD';
};
