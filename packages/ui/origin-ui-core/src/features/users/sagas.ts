import {
  CertificatesClient,
  CertificationRequestsClient,
  Configuration as ClientConfiguration,
  BlockchainPropertiesClient,
} from '@energyweb/issuer-api-client';
import { OriginFeature, signTypedMessage } from '@energyweb/utils-general';
import {
  OrganizationClient,
  UserClient,
} from '@energyweb/origin-backend-client';
import { UserStatus, OrganizationStatus } from '@energyweb/origin-backend-core';
import {
  call,
  put,
  select,
  take,
  fork,
  all,
  getContext,
  apply,
} from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { providers } from 'ethers';

import {
  UsersActions,
  ISetAuthenticationTokenAction,
  IUpdateUserBlockchainAction,
  fromUsersActions,
} from './actions';
import {
  fromGeneralActions,
  fromGeneralSelectors,
  GeneralActions,
  IEnvironment,
} from '../general';
import { Registration } from '../../utils/irec';

import {
  reloadCertificates,
  clearCertificates,
  setCertificatesClient,
  setCertificationRequestsClient,
  setBlockchainPropertiesClient,
} from '../certificates';
import { IUsersState } from './reducer';

import {
  BackendClient,
  ExchangeClient,
  IRecClient,
  NotificationTypeEnum,
  showNotification,
} from '../../utils';

import { getI18n } from 'react-i18next';
import { getWeb3 } from '../web3';
import { pollExchangeAddress } from '../../utils/pollExchangeAddress';
import { fromUsersSelectors } from './selectors';

export const LOCAL_STORAGE_KEYS = {
  AUTHENTICATION_TOKEN: 'AUTHENTICATION_TOKEN',
};

function getStoredAuthenticationToken() {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);
}

function* setPreviouslyLoggedInOffchainUser(): SagaIterator {
  yield take(GeneralActions.setEnvironment);

  const authenticationTokenFromStorage = getStoredAuthenticationToken();
  const environment: IEnvironment = yield select(
    fromGeneralSelectors.getEnvironment
  );

  if (authenticationTokenFromStorage && environment) {
    yield put(
      fromUsersActions.setAuthenticationToken(authenticationTokenFromStorage)
    );
  }
}

function* persistAuthenticationToken(): SagaIterator {
  while (true) {
    const action: ISetAuthenticationTokenAction = yield take(
      UsersActions.setAuthenticationToken
    );

    if (typeof action.payload !== 'undefined') {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN,
        action.payload
      );
    }

    yield put(fromUsersActions.refreshClients());
  }
}

function* updateClients(): SagaIterator {
  while (true) {
    yield take(UsersActions.refreshClients);

    const environment: IEnvironment = yield select(
      fromGeneralSelectors.getEnvironment
    );

    if (!environment) {
      continue;
    }

    const authenticationTokenFromStorage = getStoredAuthenticationToken();
    const backendUrl = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`;

    yield put(
      fromGeneralActions.setBackendClient(
        new BackendClient(backendUrl, authenticationTokenFromStorage)
      )
    );
    yield put(
      fromGeneralActions.setExchangeClient(
        new ExchangeClient(backendUrl, authenticationTokenFromStorage)
      )
    );
    yield put(
      fromGeneralActions.setIRecClient(
        new IRecClient(backendUrl, authenticationTokenFromStorage)
      )
    );

    const clientConfiguration = new ClientConfiguration(
      authenticationTokenFromStorage
        ? {
            baseOptions: {
              headers: {
                Authorization: `Bearer ${authenticationTokenFromStorage}`,
              },
            },
            accessToken: authenticationTokenFromStorage,
          }
        : {}
    );

    yield put(
      setBlockchainPropertiesClient(
        new BlockchainPropertiesClient(clientConfiguration, backendUrl)
      )
    );
    yield put(
      setCertificatesClient(
        new CertificatesClient(clientConfiguration, backendUrl)
      )
    );
    yield put(
      setCertificationRequestsClient(
        new CertificationRequestsClient(clientConfiguration, backendUrl)
      )
    );

    yield put(fromUsersActions.refreshUserOffchain());
  }
}

function* fetchOffchainUserDetails(): SagaIterator {
  while (true) {
    yield take(UsersActions.refreshUserOffchain);

    const { accountClient }: ExchangeClient = yield select(
      fromGeneralSelectors.getExchangeClient
    );
    const backendClient: BackendClient = yield select(
      fromGeneralSelectors.getBackendClient
    );
    const features = yield getContext('enabledFeatures');

    if (!backendClient?.accessToken) {
      continue;
    }

    const userClient: UserClient = backendClient.userClient;

    try {
      const { data: userOffchain } = yield call([userClient, userClient.me]);

      const { invitationClient } = backendClient;
      const { data: invitations } = yield call(
        [invitationClient, invitationClient.getInvitations],
        []
      );
      const userState: IUsersState = yield select(
        fromUsersSelectors.getUserState
      );

      const { data: account } = yield apply(
        accountClient,
        accountClient.getAccount,
        []
      );
      const exchangeDepositAddress = account.address;

      let iRecAccount: Registration[];

      if (features.includes(OriginFeature.IRec)) {
        const { organizationClient } = yield select(
          fromGeneralSelectors.getIRecClient
        );
        const iRecAccountResponse = userOffchain.organization
          ? yield call(
              [organizationClient, organizationClient.getRegistrations],
              []
            )
          : { data: [] };
        iRecAccount = iRecAccountResponse.data;
      }

      yield put(
        fromUsersActions.setUserState({
          ...userState,
          userOffchain,
          iRecAccount,
          exchangeDepositAddress,
          invitations: {
            ...userState.invitations,
            invitations: invitations.map((inv) => ({
              ...inv,
              createdAt: new Date(inv.createdAt),
            })),
          },
        })
      );

      yield put(reloadCertificates());
    } catch (error) {
      console.log('error', error, error.response);

      if (error?.response?.status === 401) {
        yield put(fromUsersActions.clearAuthenticationToken());
      } else {
        console.warn('unkown error while getting user profile');
      }
    }
  }
}

function* setBlockchainAddress(): SagaIterator {
  while (true) {
    const { payload }: IUpdateUserBlockchainAction = yield take(
      UsersActions.updateUserBlockchain
    );
    const { user, activeAccount } = payload;

    yield put(fromGeneralActions.setLoading(true));

    const web3: providers.JsonRpcProvider = yield select(getWeb3);
    const environment = yield select(fromGeneralSelectors.getEnvironment);
    const backendClient: BackendClient = yield select(
      fromGeneralSelectors.getBackendClient
    );
    const organizationClient: OrganizationClient =
      backendClient.organizationClient;
    const i18n = getI18n();

    try {
      if (activeAccount === null) {
        throw Error(i18n.t('user.profile.noBlockchainConnection'));
      } else if (
        user?.organization?.blockchainAccountAddress ===
        activeAccount.toLowerCase()
      ) {
        throw Error(i18n.t('user.feedback.thisAccountAlreadyConnected'));
      }

      const message = yield call(
        signTypedMessage,
        activeAccount,
        environment.REGISTRATION_MESSAGE_TO_SIGN,
        web3
      );

      yield apply(organizationClient, organizationClient.setBlockchainAddress, [
        { signedMessage: message },
      ]);

      showNotification(
        i18n.t('settings.feedback.blockchainAccountLinked'),
        NotificationTypeEnum.Success
      );
      yield put(fromUsersActions.refreshUserOffchain());
    } catch (error) {
      if (error?.data?.message) {
        showNotification(error.data.message, NotificationTypeEnum.Error);
      } else if (error?.response) {
        showNotification(
          error.response.data.message,
          NotificationTypeEnum.Error
        );
      } else if (error?.message) {
        showNotification(error.message, NotificationTypeEnum.Error);
      } else {
        console.warn('Could not log in.', error);
        showNotification(
          i18n.t('general.feedback.unknownError'),
          NotificationTypeEnum.Error
        );
      }
    }
    yield put(fromGeneralActions.setLoading(false));
  }
}

function* createUserExchangeAddress(): SagaIterator {
  while (true) {
    yield take(UsersActions.createExchangeDepositAddress);

    yield put(fromGeneralActions.setLoading(true));
    const user = yield select(fromUsersSelectors.getUserOffchain);
    const { accountClient }: ExchangeClient = yield select(
      fromGeneralSelectors.getExchangeClient
    );
    const i18n = getI18n();

    try {
      if (user.status !== UserStatus.Active) {
        throw Error(i18n.t('user.feedback.onlyActiveUsersCan'));
      } else if (
        !user.organization ||
        user.organization.status !== OrganizationStatus.Active
      ) {
        throw Error(i18n.t('user.feedback.onlyMembersOfActiveOrgCan'));
      }

      yield apply(accountClient, accountClient.create, []);

      const isAddressAssigned = yield call(
        pollExchangeAddress,
        accountClient,
        2000
      );

      if (isAddressAssigned) {
        yield put(fromUsersActions.refreshUserOffchain());
        showNotification(
          i18n.t('user.feedback.exchangeAddressSuccess'),
          NotificationTypeEnum.Success
        );
      }
    } catch (error) {
      if (error?.message) {
        showNotification(error?.message, NotificationTypeEnum.Error);
      } else {
        console.warn('Could not create exchange deposit address.', error);
        showNotification(
          i18n.t('user.feedback.exchangeAddressFailure'),
          NotificationTypeEnum.Error
        );
      }
    }
    yield put(fromGeneralActions.setLoading(false));
  }
}

function* logOutSaga(): SagaIterator {
  while (true) {
    yield take(UsersActions.clearAuthenticationToken);

    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTHENTICATION_TOKEN);

    yield put(fromUsersActions.refreshClients());
    yield put(fromUsersActions.setUserOffchain(null));
    yield put(clearCertificates());
  }
}

export function* usersSaga(): SagaIterator {
  yield all([
    fork(setPreviouslyLoggedInOffchainUser),
    fork(persistAuthenticationToken),
    fork(updateClients),
    fork(fetchOffchainUserDetails),
    fork(setBlockchainAddress),
    fork(createUserExchangeAddress),
    fork(logOutSaga),
  ]);
}
