import React from 'react';
import { useSelector } from 'react-redux';

import { OrganizationForm } from './OrganizationForm';
import { getUserOffchain } from '../../features/users/selectors';

export function OrganizationView() {
    const userOffchain = useSelector(getUserOffchain);

    return <OrganizationForm entity={userOffchain?.organization} readOnly={true} />;
}
