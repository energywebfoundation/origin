/*
 * Generated by orval v5.0.0-alpha.9 🍺
 * Do not edit manually.
 * Origin Backend API
 * Swagger documentation for the Origin Backend API
 * OpenAPI spec version: 0.1
 */
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from 'react-query';
import type {
  UserDTO,
  RegisterUserDTO,
  UpdateOwnUserSettingsDTO,
  UpdateUserProfileDTO,
  UpdatePasswordDTO,
  BindBlockchainAccountDTO,
  SuccessResponseDTO,
} from './originBackendAPI.schemas';
import { customMutator } from '../mutator/custom-mutator';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

export const userControllerRegister = <Data = unknown>(
  registerUserDTO: RegisterUserDTO
) => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user/register`,
    method: 'post',
    data: registerUserDTO,
  });
};

export const useUserControllerRegister = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerRegister>,
    Error,
    { data: RegisterUserDTO }
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerRegister>,
    Error,
    { data: RegisterUserDTO }
  >((props) => {
    const { data } = props || {};

    return userControllerRegister<Data>(data);
  }, mutationConfig);
};
export const userControllerMe = <Data = unknown>() => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user/me`,
    method: 'get',
  });
};

export const getUserControllerMeQueryKey = () => [`/api/user/me`];

export const useUserControllerMe = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  queryConfig?: UseQueryOptions<AsyncReturnType<typeof userControllerMe>, Error>
) => {
  const queryKey = getUserControllerMeQueryKey();

  const query = useQuery<AsyncReturnType<typeof userControllerMe>, Error>(
    queryKey,
    () => userControllerMe<Data>(),
    queryConfig
  );

  return {
    queryKey,
    ...query,
  };
};

export const userControllerUpdateOwnUserSettings = <Data = unknown>(
  updateOwnUserSettingsDTO: UpdateOwnUserSettingsDTO
) => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user`,
    method: 'put',
    data: updateOwnUserSettingsDTO,
  });
};

export const useUserControllerUpdateOwnUserSettings = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerUpdateOwnUserSettings>,
    Error,
    { data: UpdateOwnUserSettingsDTO }
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerUpdateOwnUserSettings>,
    Error,
    { data: UpdateOwnUserSettingsDTO }
  >((props) => {
    const { data } = props || {};

    return userControllerUpdateOwnUserSettings<Data>(data);
  }, mutationConfig);
};
export const userControllerGet = <Data = unknown>(id: number) => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user/${id}`,
    method: 'get',
  });
};

export const getUserControllerGetQueryKey = (id: number) => [`/api/user/${id}`];

export const useUserControllerGet = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  id: number,
  queryConfig?: UseQueryOptions<
    AsyncReturnType<typeof userControllerGet>,
    Error
  >
) => {
  const queryKey = getUserControllerGetQueryKey(id);

  const query = useQuery<AsyncReturnType<typeof userControllerGet>, Error>(
    queryKey,
    () => userControllerGet<Data>(id),
    { enabled: !!id, ...queryConfig }
  );

  return {
    queryKey,
    ...query,
  };
};

export const userControllerUpdateOwnProfile = <Data = unknown>(
  updateUserProfileDTO: UpdateUserProfileDTO
) => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user/profile`,
    method: 'put',
    data: updateUserProfileDTO,
  });
};

export const useUserControllerUpdateOwnProfile = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerUpdateOwnProfile>,
    Error,
    { data: UpdateUserProfileDTO }
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerUpdateOwnProfile>,
    Error,
    { data: UpdateUserProfileDTO }
  >((props) => {
    const { data } = props || {};

    return userControllerUpdateOwnProfile<Data>(data);
  }, mutationConfig);
};
export const userControllerUpdateOwnPassword = <Data = unknown>(
  updatePasswordDTO: UpdatePasswordDTO
) => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user/password`,
    method: 'put',
    data: updatePasswordDTO,
  });
};

export const useUserControllerUpdateOwnPassword = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerUpdateOwnPassword>,
    Error,
    { data: UpdatePasswordDTO }
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerUpdateOwnPassword>,
    Error,
    { data: UpdatePasswordDTO }
  >((props) => {
    const { data } = props || {};

    return userControllerUpdateOwnPassword<Data>(data);
  }, mutationConfig);
};
export const userControllerUpdateOwnBlockchainAddress = <Data = unknown>(
  bindBlockchainAccountDTO: BindBlockchainAccountDTO
) => {
  return customMutator<Data extends unknown ? UserDTO : Data>({
    url: `/api/user/chainAddress`,
    method: 'put',
    data: bindBlockchainAccountDTO,
  });
};

export const useUserControllerUpdateOwnBlockchainAddress = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerUpdateOwnBlockchainAddress>,
    Error,
    { data: BindBlockchainAccountDTO }
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerUpdateOwnBlockchainAddress>,
    Error,
    { data: BindBlockchainAccountDTO }
  >((props) => {
    const { data } = props || {};

    return userControllerUpdateOwnBlockchainAddress<Data>(data);
  }, mutationConfig);
};
export const userControllerConfirmToken = <Data = unknown>(token: string) => {
  return customMutator<Data extends unknown ? string : Data>({
    url: `/api/user/confirm-email/${token}`,
    method: 'put',
    data: undefined,
  });
};

export const useUserControllerConfirmToken = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerConfirmToken>,
    Error,
    { token: string }
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerConfirmToken>,
    Error,
    { token: string }
  >((props) => {
    const { token } = props || {};

    return userControllerConfirmToken<Data>(token);
  }, mutationConfig);
};
export const userControllerReSendEmailConfirmation = <Data = unknown>() => {
  return customMutator<Data extends unknown ? SuccessResponseDTO : Data>({
    url: `/api/user/re-send-confirm-email`,
    method: 'put',
    data: undefined,
  });
};

export const useUserControllerReSendEmailConfirmation = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  mutationConfig?: UseMutationOptions<
    AsyncReturnType<typeof userControllerReSendEmailConfirmation>,
    Error
  >
) => {
  return useMutation<
    AsyncReturnType<typeof userControllerReSendEmailConfirmation>,
    Error
  >(() => {
    return userControllerReSendEmailConfirmation<Data>();
  }, mutationConfig);
};