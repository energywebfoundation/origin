import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as queryString from 'query-string';
import { EmailConfirmationResponse } from '@energyweb/origin-backend-core';
import { getBackendClient } from '../../features/general';
import { getUserOffchain } from '../../features/users';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useLinks } from '../../utils/routing';

export function ConfirmEmail(props: any) {
    const { t } = useTranslation();

    const [confirmationState, setConfirmationState] = useState(null);

    const userClient = useSelector(getBackendClient)?.userClient;
    const user = useSelector(getUserOffchain);

    const history = useHistory();
    const { getAccountLoginLink, getDefaultLink } = useLinks();

    const { token } = queryString.parse(props.location.search);

    useEffect(() => {
        async function confirm() {
            return userClient.confirmToken(token as string);
        }
        if (userClient && token) {
            confirm()
                .then((response) => {
                    setConfirmationState(EmailConfirmationResponse[response.data]);
                })
                .then(() => {
                    if (!user) {
                        history.push(getAccountLoginLink());
                    } else {
                        history.push(getDefaultLink());
                    }
                });
        }
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
    }

    return (
        <>
            {confirmationState !== null &&
                message !== null &&
                showNotification(
                    t(`user.feedback.emailConfirmation.${message}`),
                    NotificationType.Success
                )}
        </>
    );
}
