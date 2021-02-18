import { IWeb3UpdatedAction, TWeb3Updated } from './types';

export enum Web3Actions {
    web3Updated = 'WEB3_UPDATED'
}

export const web3Updated: TWeb3Updated = (
    payload: IWeb3UpdatedAction['payload']
): IWeb3UpdatedAction => ({
    type: Web3Actions.web3Updated,
    payload
});
