import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IUser } from '@energyweb/origin-backend-core';
import { AdminUserForm } from './AdminUserForm';
import { IRecord } from './AdminUsersTable';
import { fromGeneralSelectors } from '../../features';

interface IMatchParams {
    key?: string;
    id?: string;
}

export function AdminUserView() {
    const adminClient = useSelector(fromGeneralSelectors.getBackendClient)?.adminClient;

    const location = useLocation<IRecord>();
    const [entity, setEntity] = useState<IUser>(null);
    const params: IMatchParams = useParams();

    async function fetchEntity() {
        if (!adminClient) {
            return setEntity(null);
        }

        setEntity(location.state.user);
    }

    useEffect(() => {
        fetchEntity();
    }, [params, adminClient, location]);

    return <AdminUserForm entity={entity} readOnly={false} />;
}
