import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { makeStyles, createStyles, useTheme, Tooltip } from '@material-ui/core';
import { AccountCircle, Settings, PersonAdd, ExitToApp } from '@material-ui/icons';

import { IUserWithRelations } from '@energyweb/origin-backend-core';

import { useSelector, useDispatch } from 'react-redux';
import { useLinks, dataTest, useTranslation } from '../utils';
import { getUserOffchain } from '../features/users/selectors';
import { clearAuthenticationToken } from '../features/users/actions';
import { OriginConfigurationContext } from './OriginConfigurationContext';

export function getAddressDisplay(address: string, userOffchain?: IUserWithRelations) {
    if (userOffchain) {
        return `${userOffchain?.firstName} ${userOffchain?.lastName}`;
    }

    return `${address.slice(0, 5)}...${address.slice(address.length - 3, address.length)}`;
}

const useStyles = makeStyles(() =>
    createStyles({
        icon: {
            opacity: 0.3,
            fontSize: '16px',
            marginLeft: '8px'
        },
        endIcon: {
            opacity: 0.7,
            fontSize: '16px',
            marginLeft: '8px'
        },
        logOutIcon: {
            opacity: 0.7,
            marginLeft: '8px',
            verticalAlign: 'sub',
            cursor: 'pointer'
        }
    })
);

export function Header() {
    const userOffchain = useSelector(getUserOffchain);

    const dispatch = useDispatch();

    const classes = useStyles(useTheme());

    const {
        getDevicesLink,
        getUserRegisterLink,
        getCertificatesLink,
        getAccountLink,
        getOrganizationLink,
        getAccountLoginLink
    } = useLinks();

    const originConfiguration = useContext(OriginConfigurationContext);

    const { t } = useTranslation();

    return (
        <div className="HeaderWrapper">
            <div className="Header">
                <NavLink to={getDevicesLink()}>{originConfiguration.logo}</NavLink>
                <ul className="NavMenu nav">
                    <li>
                        <NavLink to={getDevicesLink()}>{t('header.devices')}</NavLink>
                    </li>

                    {userOffchain && (
                        <>
                            <li>
                                <NavLink to={getCertificatesLink()}>
                                    {t('header.certificates')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={getOrganizationLink()}>
                                    {t('header.organizations')}
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>

                <div className="ViewProfile">
                    {!userOffchain && (
                        <>
                            &nbsp;
                            <Link className={classes.endIcon} to={getUserRegisterLink()}>
                                <Tooltip title={t('settings.registerOffchainUser')}>
                                    <PersonAdd color="primary" />
                                </Tooltip>
                            </Link>
                        </>
                    )}
                    {userOffchain ? (
                        <>
                            &nbsp;
                            <Link
                                to={getAccountLink()}
                                className={classes.endIcon}
                                {...dataTest('header-link-account-settings')}
                            >
                                <Tooltip title={t('settings.settings')}>
                                    <Settings color="primary" />
                                </Tooltip>
                            </Link>
                            <br />
                        </>
                    ) : (
                        <>
                            <Link to={getAccountLoginLink()} className={classes.endIcon}>
                                <Tooltip title={t('settings.navigation.login')}>
                                    <AccountCircle color="primary" />
                                </Tooltip>
                            </Link>
                        </>
                    )}
                    {userOffchain && (
                        <div>
                            Logged in as: {userOffchain.firstName} {userOffchain.lastName}{' '}
                            <Tooltip title="Log out">
                                <ExitToApp
                                    color="primary"
                                    className={classes.logOutIcon}
                                    onClick={() => dispatch(clearAuthenticationToken())}
                                />
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
