import { all, fork, take, apply, select, call, put } from 'redux-saga/effects';
import { BundlesActionType } from '.';
import { IExchangeClient } from '../../utils/exchange';
import { getExchangeClient } from '..';
import { fetchBundles } from '../general/sagas';
import { SagaIterator } from 'redux-saga';
import { showBundleDetails } from './actions';
import { NotificationType, showNotification } from '../..';
import { getI18n } from 'react-i18next';
import { reloadCertificates } from '../certificates';

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
            yield call(fetchBundles);
        } catch (err) {
            console.error(err);
            showNotification(i18n.t('general.feedback.unknownError'), NotificationType.Error);
        }
    }
}

export function* bundlesSaga(): SagaIterator {
    yield all([fork(cancelBundle)]);
}
