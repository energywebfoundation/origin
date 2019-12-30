import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { OrganizationForm } from './OrganizationForm';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getEnvironment } from '../../features/general/selectors';
import { IOrganization } from '@energyweb/origin-backend-core';

interface IMatchParams {
    key?: string;
    id?: string;
}

export function OrganizationView() {
    const environment = useSelector(getEnvironment);

    const [entity, setEntity] = useState<IOrganization>(null);

    const params: IMatchParams = useParams();

    async function fetchEntity(id: string) {
        if (!environment) {
            return setEntity(null);
        }

        const response = await axios.get(`${environment.BACKEND_URL}/api/Organization/${id}`);

        const data: IOrganization = response?.data;

        setEntity(data);
    }

    useEffect(() => {
        fetchEntity(params?.id);
    }, [params, environment]);

    return <OrganizationForm entity={entity} readOnly={true} />;
}
