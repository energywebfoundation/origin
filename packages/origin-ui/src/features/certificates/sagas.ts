import { put, take, all, fork, select, call, apply } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    CertificatesActions,
    ICertificateCreatedOrUpdatedAction,
    IRequestCertificatesAction,
    IShowRequestCertificatesModalAction,
    setRequestCertificatesModalVisibility,
    hideRequestCertificatesModal
} from './actions';
import { requestUser } from '../users/actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import { showNotification, NotificationType } from '../../utils/notifications';
import { Unit } from '@energyweb/utils-general';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { Role, User } from '@energyweb/user-registry';
import { Asset } from '@energyweb/asset-registry';
import { getCurrentUser } from '../users/selectors';
import { setLoading } from '../general/actions';

function* requestCertificateDetailsSaga(): SagaIterator {
    while (true) {
        const action: ICertificateCreatedOrUpdatedAction = yield take(
            CertificatesActions.certificateCreatedOrUpdated
        );

        yield put(requestUser(action.certificate.certificate.owner));
    }
}

function* requestCertificatesSaga(): SagaIterator {
    while (true) {
        const action: IRequestCertificatesAction = yield take(
            CertificatesActions.requestCertificates
        );

        yield put(setLoading(true));

        yield put(hideRequestCertificatesModal());

        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        try {
            yield call(
                Certificate.requestCertificates,
                action.payload.assetId,
                action.payload.lastReadIndex,
                configuration
            );

            const energyInKWh = action.payload.energy / Unit.kWh;

            showNotification(
                `Certificates for ${energyInKWh} kWh requested.`,
                NotificationType.Success
            );
        } catch (error) {
            showNotification(`Transaction could not be completed.`, NotificationType.Error);
        }

        yield put(setLoading(false));
    }
}

function* openRequestCertificatesModalSaga(): SagaIterator {
    while (true) {
        const action: IShowRequestCertificatesModalAction = yield take(
            CertificatesActions.showRequestCertificatesModal
        );

        const asset = action.payload.producingAsset;
        const configuration: IStoreState['configuration'] = yield select(getConfiguration);
        const currentUser: User.Entity = yield select(getCurrentUser);

        const reads: Asset.ISmartMeterRead[] = yield apply(asset, asset.getSmartMeterReads, []);

        if (asset?.owner?.address?.toLowerCase() !== currentUser?.id?.toLowerCase()) {
            showNotification(
                `You need to own the asset to request I-RECs.`,
                NotificationType.Error
            );
        } else if (!currentUser.isRole(Role.AssetManager)) {
            showNotification(
                `You need to have Asset Manager role to request I-RECs.`,
                NotificationType.Error
            );
        } else if (reads.length === 0) {
            showNotification(
                `There are no smart meter reads for this asset.`,
                NotificationType.Error
            );
        } else {
            const certificateLogic: CertificateLogic =
                configuration.blockchainProperties.certificateLogicInstance;

            const requestedCertsLength = yield apply(
                certificateLogic,
                certificateLogic.getAssetRequestedCertsForSMReadsLength,
                [Number(asset.id)]
            );

            const lastRequestedSMReadIndex = Number(requestedCertsLength);

            if (reads.length === lastRequestedSMReadIndex) {
                showNotification(
                    `You have already requested certificates for all smart meter reads for this asset.`,
                    NotificationType.Error
                );
            } else {
                yield put(setRequestCertificatesModalVisibility(true));
            }
        }
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([
        fork(requestCertificateDetailsSaga),
        fork(requestCertificatesSaga),
        fork(openRequestCertificatesModalSaga)
    ]);
}
