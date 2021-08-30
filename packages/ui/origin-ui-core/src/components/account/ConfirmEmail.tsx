import React, { memo, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as queryString from 'query-string';
import { EmailConfirmationResponse } from '@energyweb/origin-backend-core';
import { showNotification, NotificationTypeEnum } from '../../utils';

import { fromGeneralSelectors, fromUsersSelectors } from '../../features';
import { Location } from 'history';
import { useLinks } from '../../hooks';

interface IProps {
    location: Location;
}

export const ConfirmEmail = memo((props: IProps) => {
    const { t } = useTranslation();

    const [confirmationState, setConfirmationState] = useState(null);

    const userClient = useSelector(fromGeneralSelectors.getBackendClient)?.userClient;
    const user = useSelector(fromUsersSelectors.getUserOffchain);

    const history = useHistory();
    const { accountLoginPageUrl, defaultPageUrl } = useLinks();

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
                        history.push(accountLoginPageUrl);
                    } else {
                        history.push(defaultPageUrl);
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
                    NotificationTypeEnum.Success
                )}
        </>
    );
});

ConfirmEmail.displayName = 'ConfirmEmail';
