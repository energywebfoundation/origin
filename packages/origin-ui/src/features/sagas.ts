import { generalSaga } from './general/sagas';
import { contractsSaga } from './contracts/sagas';
import { usersSaga } from './users/sagas';
import { producingAssetsSaga } from './producingAssets/sagas';

export default {
    contractsSaga,
    generalSaga,
    usersSaga,
    producingAssetsSaga
};
