import { put, take, all, fork, select, call, apply, delay } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import {
    CertificatesActions,
    IAddCertificateAction,
    IRequestCertificatesAction,
    IShowRequestCertificatesModalAction,
    setRequestCertificatesModalVisibility,
    hideRequestCertificatesModal,
    IRequestCertificateEntityFetchAction,
    ICertificateFetcher,
    addCertificate,
    updateCertificate,
    requestCertificateEntityFetch,
    IUpdateCertificateAction
} from './actions';
import { requestUser } from '../users/actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import { showNotification, NotificationType } from '../../utils/notifications';
import { Unit, Currency } from '@energyweb/utils-general';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { Role } from '@energyweb/user-registry';
import { MarketUser, PurchasableCertificate } from '@energyweb/market';
import { Asset } from '@energyweb/asset-registry';
import { getCurrentUser } from '../users/selectors';
import { setLoading } from '../general/actions';
import { getCertificates, getCertificateFetcher, getCertificateById } from './selectors';

function areOffChainSettlementOptionsMissing(certificate: PurchasableCertificate.Entity) {
    return (
        certificate.forSale &&
        certificate.acceptedToken === '0x0000000000000000000000000000000000000000' &&
        (!certificate.offChainSettlementOptions ||
            (certificate.offChainSettlementOptions.currency === Currency.NONE &&
                certificate.offChainSettlementOptions.price === 0))
    );
}

function* fetchCertificateDetailsSaga(): SagaIterator {
    while (true) {
        const action: IAddCertificateAction | IUpdateCertificateAction = yield take([
            CertificatesActions.addCertificate,
            CertificatesActions.updateCertificate
        ]);

        const certificate = action.payload;

        yield put(requestUser(certificate.certificate.owner));

        if (areOffChainSettlementOptionsMissing(certificate)) {
            yield delay(100);
            yield put(requestCertificateEntityFetch(certificate.id));
        }
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
        const currentUser: MarketUser.Entity = yield select(getCurrentUser);

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

function* fetchCertificateSaga(id: string, entitiesBeingFetched: any): SagaIterator {
    if (entitiesBeingFetched.has(id)) {
        return;
    }

    const entities: PurchasableCertificate.Entity[] = yield select(getCertificates);

    const existingEntity: PurchasableCertificate.Entity = yield call(
        getCertificateById,
        entities,
        id
    );

    const configuration: IStoreState['configuration'] = yield select(getConfiguration);
    const fetcher: ICertificateFetcher = yield select(getCertificateFetcher);

    entitiesBeingFetched.set(id, true);

    try {
        if (existingEntity) {
            const reloadedEntity: PurchasableCertificate.Entity = yield call(
                fetcher.reload,
                existingEntity
            );

            if (reloadedEntity) {
                yield put(updateCertificate(reloadedEntity));
            }
        } else {
            const fetchedEntity: PurchasableCertificate.Entity = yield call(
                fetcher.fetch,
                id,
                configuration
            );

            if (fetchedEntity) {
                yield put(addCertificate(fetchedEntity));
            }
        }
    } catch (error) {
        console.error('Error while fetching certificate', error);
    }

    entitiesBeingFetched.delete(id);
}

function* requestCertificateSaga(): SagaIterator {
    const usersBeingFetched = new Map<string, boolean>();

    while (true) {
        const action: IRequestCertificateEntityFetchAction = yield take(
            CertificatesActions.requestCertificateEntityFetch
        );

        if (!action.payload) {
            return;
        }

        const entityId = action.payload.toLowerCase();

        try {
            yield fork(fetchCertificateSaga, entityId, usersBeingFetched);
        } catch (error) {
            console.error('requestCertificateSaga: error', error);
        }
    }
}

export function* certificatesSaga(): SagaIterator {
    yield all([
        fork(fetchCertificateDetailsSaga),
        fork(requestCertificatesSaga),
        fork(openRequestCertificatesModalSaga),
        fork(requestCertificateSaga)
    ]);
}
