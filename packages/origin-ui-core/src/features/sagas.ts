import { generalSaga } from './general/sagas';
import { contractsSaga } from './contracts/sagas';
import { usersSaga } from './users/sagas';
import { certificatesSaga } from './certificates/sagas';
import { authenticationSaga } from './authentication/sagas';

export const sagas = {
    authenticationSaga,
    contractsSaga,
    generalSaga,
    usersSaga,
    certificatesSaga
};
