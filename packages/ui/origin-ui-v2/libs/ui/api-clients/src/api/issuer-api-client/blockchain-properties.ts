/*
 * Generated by orval v5.0.0-alpha.9 🍺
 * Do not edit manually.
 * Issuer API
 * Swagger documentation for the Issuer API
 * OpenAPI spec version: 0.1
 */
import { useQuery, UseQueryOptions } from 'react-query';
import type { BlockchainPropertiesDTO } from './issuerAPI.schemas';
import { customMutator } from '../mutator/custom-mutator';

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

export const blockchainPropertiesControllerGet = <Data = unknown>() => {
  return customMutator<Data extends unknown ? BlockchainPropertiesDTO : Data>({
    url: `/api/blockchain-properties`,
    method: 'get',
  });
};

export const getBlockchainPropertiesControllerGetQueryKey = () => [
  `/api/blockchain-properties`,
];

export const useBlockchainPropertiesControllerGet = <
  Data extends unknown = unknown,
  Error extends unknown = unknown
>(
  queryConfig?: UseQueryOptions<
    AsyncReturnType<typeof blockchainPropertiesControllerGet>,
    Error
  >
) => {
  const queryKey = getBlockchainPropertiesControllerGetQueryKey();

  const query = useQuery<
    AsyncReturnType<typeof blockchainPropertiesControllerGet>,
    Error
  >(queryKey, () => blockchainPropertiesControllerGet<Data>(), queryConfig);

  return {
    queryKey,
    ...query,
  };
};