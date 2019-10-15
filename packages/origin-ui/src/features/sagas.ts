import { generalSaga } from './general/sagas';
import { contractsSaga } from './contracts/sagas';
import { usersSaga } from './users/sagas';
import { producingAssetsSaga } from './producingAssets/sagas';
import { certificatesSaga } from './certificates/sagas';
import { authenticationSaga } from './authentication/sagas';

export default {
    authenticationSaga,
    contractsSaga,
    generalSaga,
    usersSaga,
    producingAssetsSaga,
    certificatesSaga
};
