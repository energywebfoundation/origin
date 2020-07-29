import { generalSaga } from './general/sagas';
import { usersSaga } from './users/sagas';
import { certificatesSaga } from './certificates/sagas';
import { bundlesSaga } from './bundles';
import { ordersSaga } from './orders';

export const sagas = {
    generalSaga,
    usersSaga,
    certificatesSaga,
    bundlesSaga,
    ordersSaga
};
