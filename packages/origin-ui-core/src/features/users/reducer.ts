import {
    IUser,
    IOrganizationWithRelationsIds,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';

import { UsersActions, IUsersAction } from './actions';

export interface IUsersState {
    activeBlockchainAccountAddress: string;
    userOffchain: IUser;
    organizations: IOrganizationWithRelationsIds[];
    irecAccount: any;
    invitations: {
        invitations: IOrganizationInvitation[];
        showPendingInvitationsModal: boolean;
    };
}

const defaultState: IUsersState = {
    activeBlockchainAccountAddress: null,
    userOffchain: null,
    organizations: [],
    irecAccount: null,
    invitations: {
        showPendingInvitationsModal: false,
        invitations: []
    }
};

export default function reducer(state = defaultState, action: IUsersAction): IUsersState {
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

        case UsersActions.setUserState:
            return action.payload;
        default:
            return state;
    }
}
