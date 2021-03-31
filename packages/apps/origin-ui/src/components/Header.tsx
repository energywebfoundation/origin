import React, { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { fromUsersActions, fromUsersSelectors, useLinks } from '@energyweb/origin-ui-core';

export const Header = (): ReactElement => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { defaultPageUrl, userRegisterPageUrl, accountLoginPageUrl } = useLinks();

    return (
        <div className="HeaderWrapper">
            <div className="Header">
                <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                    className="UserActionsLinks"
                >
                    {user ? (
                        <Grid item>
                            <Link
                                data-cy="user-logout-button"
                                to={defaultPageUrl}
                                onClick={() => {
                                    dispatch(fromUsersActions.clearAuthenticationToken());
                                }}
                            >
                                {t('user.actions.logout')}
                            </Link>
                        </Grid>
                    ) : (
                        <Grid item>
                            <Link to={userRegisterPageUrl}>{t('user.actions.register')}</Link>
                            <Link data-cy="user-login-button" to={accountLoginPageUrl}>
                                {t('user.actions.login')}
                            </Link>
                        </Grid>
                    )}
                </div>
            </div>
        </div>
    );
};
