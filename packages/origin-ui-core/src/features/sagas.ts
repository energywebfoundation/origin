import { generalSaga } from './general/sagas';
import { usersSaga } from './users/sagas';
import { certificatesSaga } from './certificates/sagas';
import { bundlesSaga } from './bundles';

export const sagas = {
    generalSaga,
    usersSaga,
    certificatesSaga,
    bundlesSaga
};
