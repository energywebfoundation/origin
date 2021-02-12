import { IUser, IFullOrganization, IOrganizationInvitation } from '@energyweb/origin-backend-core';
import { Registration } from '../../utils/irec/types';
import { UsersActions, IUsersAction } from './actions';

export interface IUsersState {
    activeBlockchainAccountAddress: string;
    exchangeDepositAddress: string;
    userOffchain: IUser;
    organizations: IFullOrganization[];
    invitations: {
        invitations: IOrganizationInvitation[];
        showPendingInvitationsModal: boolean;
    };
    iRecAccount?: Registration[];
}

const defaultState: IUsersState = {
    activeBlockchainAccountAddress: null,
    exchangeDepositAddress: null,
    userOffchain: null,
    organizations: [],
    iRecAccount: [],
    invitations: {
        showPendingInvitationsModal: false,
        invitations: []
    }
};

export function usersState(state = defaultState, action: IUsersAction): IUsersState {
    switch (action.type) {
        case UsersActions.setActiveBlockchainAccountAddress:
            return {
                ...state,
                activeBlockchainAccountAddress: action.payload
            };

        case UsersActions.setUserOffchain:
            return {
                ...state,
                userOffchain: action.payload
            };

        case UsersActions.addOrganizations:
            const organizations = [...state.organizations];
            action.payload.map((newOrganization) => {
                if (!organizations.find((o) => o.id === newOrganization.id)) {
                    organizations.push(newOrganization);
                }
            });

            return {
                ...state,
                organizations
            };

        case UsersActions.setInvitations:
            return {
                ...state,
                invitations: {
                    ...state.invitations,
                    invitations: action.payload as IOrganizationInvitation[]
                }
            };

        case UsersActions.setIRecAccount:
            return {
                ...state,
                iRecAccount: action.payload
            };

        case UsersActions.setUserState:
            return action.payload;
        default:
            return state;
    }
}
