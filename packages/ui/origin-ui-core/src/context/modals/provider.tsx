import React, { createContext, useContext, useReducer } from 'react';
import { orgModalsInitialState, orgModalsReducer } from './reducer';
import { IOrganizationModalsStore, TOrganizationModalsAction } from './types';

const OrganizationModalsStore = createContext<IOrganizationModalsStore>(null);
const OrganizationModalsDispatch = createContext<React.Dispatch<TOrganizationModalsAction>>(null);

export const OrganizationModalsProvider = ({ children }) => {
    const [state, dispatch] = useReducer(orgModalsReducer, orgModalsInitialState);

    return (
        <OrganizationModalsStore.Provider value={state}>
            <OrganizationModalsDispatch.Provider value={dispatch}>
                {children}
            </OrganizationModalsDispatch.Provider>
        </OrganizationModalsStore.Provider>
    );
};

export const useOrgModalsStore = () => {
    return useContext(OrganizationModalsStore);
};

export const useOrgModalsDispatch = () => {
    return useContext(OrganizationModalsDispatch);
};
