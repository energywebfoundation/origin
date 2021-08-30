import { FormikErrors } from 'formik';

export interface IBlockchainAddressesFormDataSchema {
    blockchainAccountAddress: string;
    exchangeDepositAddress: string;
}

export type ValidationHandlerReturnType = (
    values: IBlockchainAddressesFormDataSchema
) => Promise<Record<string, never> | FormikErrors<IBlockchainAddressesFormDataSchema>>;
