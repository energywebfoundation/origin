import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IOrganization } from '@energyweb/origin-backend-core';

import { OrganizationForm } from './OrganizationForm';
import { getOffChainDataSource } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';

interface IMatchParams {
    key?: string;
    id?: string;
}

export function OrganizationView() {
    const userOffchain = useSelector(getUserOffchain);
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;

    const [entity, setEntity] = useState<IOrganization>(null);

    const params: IMatchParams = useParams();

    async function fetchEntity(id: string | number) {
        if (!organizationClient) {
            return setEntity(null);
        }

        setEntity(await organizationClient.getById(Number(id)));
    }

    useEffect(() => {
        fetchEntity(params?.id ?? userOffchain?.organization?.id);
    }, [params, organizationClient]);

    return <OrganizationForm entity={entity} readOnly={true} />;
}
