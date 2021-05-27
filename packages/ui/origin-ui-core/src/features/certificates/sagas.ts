import {
  Certificate,
  Contracts,
  IBlockchainProperties,
} from '@energyweb/issuer';
import {
  BlockchainPropertiesClient,
  CertificatesClient,
  CertificationRequestsClient,
} from '@energyweb/issuer-api-client';
import { IUser } from '@energyweb/origin-backend-core';
import { ContractReceipt, ContractTransaction, ethers } from 'ethers';
import { getI18n } from 'react-i18next';
import { SagaIterator } from 'redux-saga';
import {
  all,
  apply,
  call,
  delay,
  fork,
  put,
  select,
  take,
} from 'redux-saga/effects';

import {
  CertificateSource,
  clearCertificates,
  IResyncCertificateAction,
  reloadCertificates,
  updateCertificate,
} from '.';
import { moment, NotificationTypeEnum, showNotification } from '../../utils';
import { certificateEnergyStringToBN } from '../../utils/certificates';
import { ExchangeClient } from '../../utils/clients/ExchangeClient';
import {
  IAccountMismatchModalResolvedAction,
  GeneralActions,
  fromGeneralActions,
} from '../general/actions';
import {
  enhanceCertificate,
  fetchDataAfterConfigurationChange,
} from '../general/sagas';
import { getConfiguration } from '../configuration';
import { getWeb3 } from '../web3';
import {
  addCertificate,
  CertificatesActions,
  IRequestCertificateApprovalAction,
  IRequestCertificateEntityFetchAction,
  IRequestCertificatesAction,
  IRequestClaimCertificateAction,
  IRequestClaimCertificateBulkAction,
  IRequestPublishForSaleAction,
  IRequestWithdrawCertificateAction,
} from './actions';
import {
  getBlockchainPropertiesClient,
  getCertificateById,
  getCertificates,
  getCertificatesClient,
  getCertificationRequestsClient,
} from './selectors';
import { ICertificate, ICertificateViewItem } from './types';
import { fromGeneralSelectors } from '../general';
import { fromUsersSelectors } from '../users';

export function* getCertificate(id: number, byTokenId = false): any {
  const certificatesClient: CertificatesClient = yield select(
    getCertificatesClient
  );

  const { data: certificate } = yield apply(
    certificatesClient,
    byTokenId ? certificatesClient.getByTokenId : certificatesClient.get,
    [id]
  );

  return {
    ...certificate,
    energy: certificateEnergyStringToBN(certificate.energy),
  };
}

export function* getBlockchainCertificate(id: number): any {
  const blockchainPropertiesClient: BlockchainPropertiesClient = yield select(
    getBlockchainPropertiesClient
  );

  const { data: blockchainProperties } = yield apply(
    blockchainPropertiesClient,
    blockchainPropertiesClient.get,
    []
  );

  const web3: ethers.providers.JsonRpcProvider = yield select(getWeb3);

  const configuration: IBlockchainProperties = {
    web3,
    registry: Contracts.factories.RegistryFactory.connect(
      blockchainProperties.registry,
      web3
    ),
    issuer: Contracts.factories.IssuerFactory.connect(
      blockchainProperties.issuer,
      web3
    ),
    activeUser: web3.getSigner(),
  };

  const certificate = new Certificate(id, configuration);

  yield call([certificate, certificate.sync]);

  return certificate;
}

function* requestCertificatesSaga(): SagaIterator {
  while (true) {
    const action: IRequestCertificatesAction = yield take(
      CertificatesActions.requestCertificates
    );

    yield put(fromGeneralActions.setLoading(true));

    const { startTime, endTime, energy, files, deviceId } =
      action.payload.requestData;
    const closeModalCallback = action.payload.callback;

    try {
      const certificationRequestsClient: CertificationRequestsClient =
        yield select(getCertificationRequestsClient);
      const { accountClient }: ExchangeClient = yield select(
        fromGeneralSelectors.getExchangeClient
      );
      const {
        data: { address },
      } = yield call([accountClient, accountClient.getAccount]);

      if (!address) {
        throw Error(
          'Only users with Exchange Deposit Address can request certificates.'
        );
      }

      yield apply(
        certificationRequestsClient,
        certificationRequestsClient.create,
        [
          {
            to: address,
            energy: energy.toString(),
            fromTime: startTime,
            toTime: endTime,
            deviceId,
            files,
            isPrivate: false,
          },
        ]
      );

      if (closeModalCallback) {
        yield call(closeModalCallback);
      }

      showNotification(`Certificates requested.`, NotificationTypeEnum.Success);
    } catch (error) {
      console.warn('Error while requesting certificates', error);

      let errorMsg;

      switch (error?.response?.status) {
        case 409:
          errorMsg = `There is already a certificate requested for that time period.`;
          break;
        case 412:
          errorMsg = `Only Active users can request certificates.`;
          break;
        default:
          errorMsg = `Transaction could not be completed.`;
      }

      showNotification(errorMsg, NotificationTypeEnum.Error);
    }

    yield put(fromGeneralActions.setLoading(false));
  }
}

function* fetchCertificateSaga(
  id: number,
  entitiesBeingFetched: any
): SagaIterator {
  if (entitiesBeingFetched.has(id)) {
    return;
  }

  const entities: ICertificateViewItem[] = yield select(getCertificates);

  const existingEntity: ICertificateViewItem = yield call(
    getCertificateById,
    entities,
    id
  );

  entitiesBeingFetched.set(id, true);

  try {
    if (existingEntity?.source === CertificateSource.Blockchain) {
      const fetchedCertificate: ICertificate = yield call(getCertificate, id);

      if (fetchedCertificate) {
        yield put(
          addCertificate({
            ...fetchedCertificate,
            source: CertificateSource.Blockchain,
          })
        );
      }
    }
  } catch (error) {
    console.error('Error while fetching certificate', error);
  }

  entitiesBeingFetched.delete(id);
}

function* resyncCertificateSaga(): SagaIterator {
  while (true) {
    const action: IResyncCertificateAction = yield take(
      CertificatesActions.resyncCertificate
    );

    if (!action.payload) {
      continue;
    }

    const { id, assetId } = action.payload;

    const certificate: ICertificate = yield call(getCertificate, id);
    const user = yield select(fromUsersSelectors.getUserOffchain);

    const { accountBalanceClient }: ExchangeClient = yield select(
      fromGeneralSelectors.getExchangeClient
    );

    const {
      data: { available },
    } = yield apply(accountBalanceClient, accountBalanceClient.get, null);

    const asset = available.find((a) => a.asset.id === assetId);
    yield put(
      updateCertificate(
        enhanceCertificate(certificate, user.blockchainAccountAddress, asset)
      )
    );
  }
}

function* requestCertificateSaga(): SagaIterator {
  const entitiesBeingFetched = new Map<string, boolean>();

  while (true) {
    const action: IRequestCertificateEntityFetchAction = yield take(
      CertificatesActions.requestCertificateEntityFetch
    );

    if (!action.payload) {
      continue;
    }

    const entityId = action.payload;

    try {
      yield fork(fetchCertificateSaga, entityId, entitiesBeingFetched);
    } catch (error) {
      console.error('requestCertificateSaga: error', error);
    }
  }
}

function* requestPublishForSaleSaga(): SagaIterator {
  while (true) {
    const action: IRequestPublishForSaleAction = yield take(
      CertificatesActions.requestPublishForSale
    );
    const { accountClient, transferClient, ordersClient }: ExchangeClient =
      yield select(fromGeneralSelectors.getExchangeClient);

    const certificatesClient: CertificatesClient = yield select(
      getCertificatesClient
    );

    const { amount, certificateId, callback, price, source } = action.payload;
    let { assetId } = action.payload;

    const i18n = getI18n();

    yield put(fromGeneralActions.setLoading(true));

    try {
      if (source === CertificateSource.Blockchain) {
        const { data: account } = yield call([
          accountClient,
          accountClient.getAccount,
        ]);

        const { data: certificate } = yield apply(
          certificatesClient,
          certificatesClient.get,
          [certificateId]
        );

        const onChainCertificate: Certificate = yield call(
          getBlockchainCertificate,
          certificate.tokenId
        );

        const transferResult: ContractTransaction = yield call(
          [onChainCertificate, onChainCertificate.transfer],
          account.address,
          amount
        );

        while (true) {
          const { data: transfers } = yield call([
            transferClient,
            transferClient.getMyTransfers,
          ]);

          const transfer = transfers.find(
            (item) => item.transactionHash === transferResult.hash
          );
          if (transfer) {
            assetId = transfer.asset.id;
            break;
          }

          yield delay(1000);
        }
      }

      yield call([ordersClient, ordersClient.createAsk], {
        assetId,
        price,
        volume: amount.toString(),
        validFrom: moment().toISOString(),
      });
      yield put(reloadCertificates());
      showNotification(
        i18n.t('certificate.feedback.certificatePublished'),
        NotificationTypeEnum.Success
      );
    } catch (error) {
      console.error(error);
      showNotification(
        i18n.t('general.feedback.unknownError'),
        NotificationTypeEnum.Error
      );
    }

    yield put(fromGeneralActions.setLoading(false));

    if (callback) {
      yield call(callback);
    }
  }
}

function* assertCorrectBlockchainAccount() {
  const user: IUser = yield select(fromUsersSelectors.getUserOffchain);
  const activeBlockchainAddress: string = yield select(
    fromUsersSelectors.getActiveBlockchainAccountAddress
  );

  if (user) {
    if (
      !user.organization?.blockchainAccountAddress ||
      !activeBlockchainAddress
    ) {
      yield put(fromGeneralActions.setNoAccountModalVisibility(true));

      return false;
    } else if (
      user.organization.blockchainAccountAddress.toLowerCase() ===
      activeBlockchainAddress.toLowerCase()
    ) {
      return true;
    }
  }

  yield put(
    fromGeneralActions.setAccountMismatchModalProperties({
      visibility: true,
    })
  );
  const { payload: shouldContinue }: IAccountMismatchModalResolvedAction =
    yield take(GeneralActions.accountMismatchModalResolved);

  return shouldContinue;
}

function* requestDepositSaga(): SagaIterator {
  while (true) {
    const action: IRequestPublishForSaleAction = yield take(
      CertificatesActions.requestDepositCertificate
    );
    const { accountClient }: ExchangeClient = yield select(
      fromGeneralSelectors.getExchangeClient
    );

    const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

    if (!shouldContinue) {
      continue;
    }
    const certificatesClient: CertificatesClient = yield select(
      getCertificatesClient
    );

    const { amount, certificateId, callback } = action.payload;

    const i18n = getI18n();

    yield put(fromGeneralActions.setLoading(true));

    try {
      const { data: account } = yield call([
        accountClient,
        accountClient.getAccount,
      ]);

      const { data: certificate } = yield apply(
        certificatesClient,
        certificatesClient.get,
        [certificateId]
      );

      const onChainCertificate: Certificate = yield call(
        getBlockchainCertificate,
        certificate.tokenId
      );

      yield call(
        [onChainCertificate, onChainCertificate.transfer],
        account.address,
        amount
      );

      showNotification(
        i18n.t('certificate.feedback.certificateDeposited'),
        NotificationTypeEnum.Success
      );
    } catch (error) {
      console.error(error);
      showNotification(
        i18n.t('general.feedback.unknownError'),
        NotificationTypeEnum.Error
      );
    }

    yield put(fromGeneralActions.setLoading(false));

    if (callback) {
      yield call(callback);
    }
  }
}

function* requestClaimCertificateSaga(): SagaIterator {
  while (true) {
    const action: IRequestClaimCertificateAction = yield take(
      CertificatesActions.requestClaimCertificate
    );

    const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

    if (!shouldContinue) {
      continue;
    }

    const { certificateId, amount, claimData, callback } = action.payload;

    yield put(fromGeneralActions.setLoading(true));

    const i18n = getI18n();

    const certificatesClient: CertificatesClient = yield select(
      getCertificatesClient
    );

    try {
      const { data: certificate } = yield apply(
        certificatesClient,
        certificatesClient.get,
        [certificateId]
      );

      const onChainCertificate: Certificate = yield call(
        getBlockchainCertificate,
        certificate.tokenId
      );

      const claimResult: ContractTransaction = yield call(
        [onChainCertificate, onChainCertificate.claim],
        claimData,
        amount
      );

      const txResult: ContractReceipt = yield call([
        claimResult,
        claimResult.wait,
      ]);

      if (!txResult.status) {
        showNotification('Claiming failed.', NotificationTypeEnum.Error);
        continue;
      }

      if (callback) {
        yield call(callback);
      }

      showNotification(
        i18n.t('certificate.feedback.claimed', { id: certificateId }),
        NotificationTypeEnum.Success
      );
      yield put(reloadCertificates());
    } catch (error) {
      console.error(error);
      showNotification(
        i18n.t('general.feedback.unknownError'),
        NotificationTypeEnum.Error
      );
    }

    yield put(fromGeneralActions.setLoading(false));
  }
}

function* requestClaimCertificateBulkSaga(): SagaIterator {
  while (true) {
    const action: IRequestClaimCertificateBulkAction = yield take(
      CertificatesActions.requestClaimCertificateBulk
    );

    const shouldContinue: boolean = yield call(assertCorrectBlockchainAccount);

    if (!shouldContinue) {
      continue;
    }

    const certificatesClient: CertificatesClient = yield select(
      getCertificatesClient
    );
    const { certificateIds, claimData } = action.payload;

    const i18n = getI18n();

    yield put(fromGeneralActions.setLoading(true));

    try {
      yield apply(certificatesClient, certificatesClient.bulkClaim, [
        {
          certificateIds: certificateIds.map((id) => id),
          claimData,
        },
      ]);
      yield put(reloadCertificates());

      showNotification(
        i18n.t('certificate.feedback.certificatesClaimed'),
        NotificationTypeEnum.Success
      );
    } catch (error) {
      console.error(error);
      showNotification(
        i18n.t('general.feedback.unknownError'),
        NotificationTypeEnum.Error
      );
    }

    yield put(fromGeneralActions.setLoading(false));
  }
}

function* requestCertificateApprovalSaga(): SagaIterator {
  while (true) {
    const action: IRequestCertificateApprovalAction = yield take(
      CertificatesActions.requestCertificateApproval
    );

    const certificationRequestsClient: CertificationRequestsClient =
      yield select(getCertificationRequestsClient);

    const { certificationRequestId, callback } = action.payload;

    const i18n = getI18n();

    yield put(fromGeneralActions.setLoading(true));

    try {
      yield apply(
        certificationRequestsClient,
        certificationRequestsClient.approve,
        [certificationRequestId]
      );

      showNotification(
        i18n.t('certificate.feedback.approved'),
        NotificationTypeEnum.Success
      );
    } catch (error) {
      console.error(error);
      showNotification(
        i18n.t('general.feedback.unknownError'),
        NotificationTypeEnum.Error
      );
    }

    yield put(fromGeneralActions.setLoading(false));

    if (callback) {
      yield call(callback);
    }
  }
}

export function* withdrawSaga(): SagaIterator {
  while (true) {
    const action: IRequestWithdrawCertificateAction = yield take(
      CertificatesActions.withdrawCertificate
    );
    const { callback } = action.payload;
    const { transferClient }: ExchangeClient = yield select(
      fromGeneralSelectors.getExchangeClient
    );
    const i18n = getI18n();
    try {
      yield call(
        [transferClient, transferClient.requestWithdrawal],
        action.payload
      );
      yield put(reloadCertificates());
      if (callback) {
        yield call(callback);
      }
      showNotification(
        i18n.t('certificate.feedback.withdrawn'),
        NotificationTypeEnum.Success
      );
    } catch (error) {
      console.error(error);
      showNotification(
        i18n.t('general.feedback.unknownError'),
        NotificationTypeEnum.Error
      );
    }
  }
}

function* reloadCertificatesSaga(): SagaIterator {
  while (true) {
    yield take(CertificatesActions.reloadCertificates);
    yield put(clearCertificates());
    const configuration = yield select(getConfiguration);
    if (!configuration) {
      continue;
    }
    yield call(fetchDataAfterConfigurationChange);
  }
}

export function* certificatesSaga(): SagaIterator {
  yield all([
    fork(requestCertificatesSaga),
    fork(requestCertificateSaga),
    fork(requestPublishForSaleSaga),
    fork(requestClaimCertificateSaga),
    fork(requestClaimCertificateBulkSaga),
    fork(requestCertificateApprovalSaga),
    fork(resyncCertificateSaga),
    fork(withdrawSaga),
    fork(requestDepositSaga),
    fork(reloadCertificatesSaga),
  ]);
}
