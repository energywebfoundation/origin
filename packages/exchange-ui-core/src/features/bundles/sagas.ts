import { SagaIterator } from 'redux-saga';
import { all, fork, take, apply, select, call, put } from 'redux-saga/effects';
import { getI18n } from 'react-i18next';
import { BigNumber } from 'ethers';
import { UserStatus } from '@energyweb/origin-backend-core';
import {
    NotificationType,
    showNotification,
    reloadCertificates,
    getUserOffchain,
    setLoading
} from '@energyweb/origin-ui-core';
import { IExchangeClient, Bundle } from '../../utils/exchange';
import { getExchangeClient } from '../general';
import {
    BundlesActionType,
    showBundleDetails,
    clearBundles,
    storeBundle,
    ICreateBundleAction,
    fetchBundles
} from './actions';

function* fetchBundlesSaga(): SagaIterator {
    while (true) {
        yield take(BundlesActionType.FETCH_BUNDLES);

        yield put(clearBundles());
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);

        const bundles: Bundle[] = yield apply(
            exchangeClient,
            exchangeClient.getAvailableBundles,
            null
        );
        const user = yield select(getUserOffchain);

        const ownBundles: Bundle[] =
            user && user.status === UserStatus.Active
                ? yield apply(exchangeClient, exchangeClient.getOwnBundles, null)
                : [];

        for (const bundle of bundles) {
            bundle.own = ownBundles.find((b) => b.id === bundle.id) !== undefined;
            bundle.items.forEach((item) => {
                item.currentVolume = BigNumber.from(item.currentVolume.toString());
                item.startVolume = BigNumber.from(item.startVolume.toString());
            });
            if (
                bundle.items
                    .reduce((total, item) => total.add(item.currentVolume), BigNumber.from(0))
                    .isZero()
            ) {
                continue;
            }
            bundle.volume = BigNumber.from(bundle.volume.toString());
            yield put(storeBundle(bundle));
        }
    }
}

function* requestCreateBundle() {
    while (true) {
        const {
            payload: { bundleDTO, callback }
        }: ICreateBundleAction = yield take(BundlesActionType.CREATE);
        yield put(setLoading(true));
        const i18n = getI18n();
        const exchangeClient = yield select(getExchangeClient);
        try {
            yield apply(exchangeClient, exchangeClient.createBundle, [bundleDTO]);
            showNotification(
                i18n.t('certificate.feedback.bundle_created'),
                NotificationType.Success
            );
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
        yield put(setLoading(false));
        yield call(callback);
    }
}

function* buyBundle() {
    while (true) {
        const {
            payload: { bundleDTO }
        } = yield take(BundlesActionType.BUY);
        yield put(setLoading(true));
        const i18n = getI18n();
        const exchangeClient = yield select(getExchangeClient);
        try {
            yield apply(exchangeClient, exchangeClient.buyBundle, [bundleDTO]);
            showNotification(
                i18n.t('certificate.feedback.bundle_bought'),
                NotificationType.Success
            );
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
        yield put(fetchBundles());
        yield put(setLoading(false));
        yield put(showBundleDetails(false));
    }
}

function* cancelBundle(): SagaIterator {
    while (true) {
        const action = yield take(BundlesActionType.CANCEL_BUNDLE);
        const i18n = getI18n();
        const { payload } = action;
        const exchangeClient: IExchangeClient = yield select(getExchangeClient);
        try {
            yield apply(exchangeClient, exchangeClient.cancelBundle, [payload]);
            showNotification(
                i18n.t('certificate.feedback.bundleCanceld'),
                NotificationType.Success
            );
            yield put(showBundleDetails(false));
            yield put(reloadCertificates());
            yield put(fetchBundles());
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
    }
}

export function* bundlesSaga(): SagaIterator {
    yield all([
        fork(cancelBundle),
        fork(requestCreateBundle),
        fork(buyBundle),
        fork(fetchBundlesSaga)
    ]);
}
