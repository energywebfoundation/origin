import { generalSaga, usersSaga, certificatesSaga } from '@energyweb/origin-ui-core';
import {
    ordersSaga,
    bundlesSaga,
    exchangeGeneralSaga,
    supplySaga
} from '@energyweb/exchange-ui-core';
import { iRecGeneralSaga, iRecDevicesSaga } from '@energyweb/origin-ui-irec-core';

export const sagas = {
    generalSaga,
    usersSaga,
    certificatesSaga,
    exchangeGeneralSaga,
    ordersSaga,
    bundlesSaga,
    supplySaga,
    iRecGeneralSaga,
    iRecDevicesSaga
};
