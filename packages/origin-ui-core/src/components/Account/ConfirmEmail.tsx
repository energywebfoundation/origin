import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../utils';
import { useSelector } from 'react-redux';

import * as queryString from 'query-string';
import { getOffChainDataSource } from '../..';
import { EmailConfirmationResponse } from '@energyweb/origin-backend-core';

export function ConfirmEmail(props: any) {
    const { t } = useTranslation();

    const [confirmationState, setConfirmationState] = useState(null);
    const [clientLoaded, setClientLoaded] = useState(false);

    const userClient = useSelector(getOffChainDataSource)?.userClient;

    if (userClient && !clientLoaded) {
        setClientLoaded(true);
    }

    const { token } = queryString.parse(props.location.search);

    useEffect(() => {
        async function confirm() {
            if (!token || !clientLoaded) {
                return false;
            }

            return userClient.confirmEmail(token as string);
        }

        confirm().then((result: EmailConfirmationResponse) => setConfirmationState(result));
    }, [userClient]);

    let message = null;

    switch (confirmationState) {
        case EmailConfirmationResponse.AlreadyConfirmed:
            message = 'alreadyConfirmed';
            break;
        case EmailConfirmationResponse.Success:
            message = 'confirmed';
            break;
        case EmailConfirmationResponse.Expired:
            message = 'expired';
            break;
        default:
            message = 'loading';
    }

    return <div>{t(`user.feedback.emailConfirmation.${message}`)}</div>;
}
