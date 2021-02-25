import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useLinks, getUserOffchain, clearAuthenticationToken } from '@energyweb/origin-ui-core';

export function Header() {
    const user = useSelector(getUserOffchain);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { getDefaultLink, getUserRegisterLink, getAccountLoginLink } = useLinks();

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
                                to={getDefaultLink()}
                                onClick={() => {
                                    dispatch(clearAuthenticationToken());
                                }}
                            >
                                {t('user.actions.logout')}
                            </Link>
                        </Grid>
                    ) : (
                        <Grid item>
                            <Link to={getUserRegisterLink()}>{t('user.actions.register')}</Link>
                            <Link to={getAccountLoginLink()}>{t('user.actions.login')}</Link>
                        </Grid>
                    )}
                </div>
            </div>
        </div>
    );
}
