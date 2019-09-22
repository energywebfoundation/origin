import { IStoreState } from '../../types/index';

export const getCertificates = (state: IStoreState) => state.certificates.certificates;
