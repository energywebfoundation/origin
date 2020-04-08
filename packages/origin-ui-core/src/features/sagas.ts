import { generalSaga } from './general/sagas';
import { contractsSaga } from './contracts/sagas';
import { usersSaga } from './users/sagas';
import { certificatesSaga } from './certificates/sagas';

export const sagas = {
    contractsSaga,
    generalSaga,
    usersSaga,
    certificatesSaga
};
