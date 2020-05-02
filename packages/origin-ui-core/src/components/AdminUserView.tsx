import { useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getOffChainDataSource } from '../features/general/selectors';
import { useSelector } from 'react-redux';
import { IUser } from '@energyweb/origin-backend-core';
import { AdminUserForm } from './AdminUserForm';

interface IMatchParams {
    key?: string;
    id?: string;
}

export function AdminUserView() {
    const adminClient = useSelector(getOffChainDataSource)?.adminClient;

    const location = useLocation();
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
