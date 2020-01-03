import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { OrganizationForm } from './OrganizationForm';
import { useSelector } from 'react-redux';
import { getOrganizationClient } from '../../features/general/selectors';
import { IOrganization } from '@energyweb/origin-backend-core';

interface IMatchParams {
    key?: string;
    id?: string;
}

export function OrganizationView() {
    const organizationClient = useSelector(getOrganizationClient);

    const [entity, setEntity] = useState<IOrganization>(null);

    const params: IMatchParams = useParams();

    async function fetchEntity(id: string) {
        if (!organizationClient) {
            return setEntity(null);
        }

        setEntity(await organizationClient.getById(Number(id)));
    }

    useEffect(() => {
        fetchEntity(params?.id);
    }, [params, organizationClient]);

    return <OrganizationForm entity={entity} readOnly={true} />;
}
