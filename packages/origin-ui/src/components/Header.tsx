import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link, useHistory } from 'react-router-dom';
import {
    makeStyles,
    createStyles,
    useTheme,
    Tooltip,
    Typography,
    Grid,
    Theme
} from '@material-ui/core';
import { AccountCircle, Settings, PersonAdd, ExitToApp } from '@material-ui/icons';
import { IUser, Role, isRole, UserStatus } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import {
    useLinks,
    dataTest,
    useTranslation,
    getUserOffchain,
    clearAuthenticationToken
} from '@energyweb/origin-ui-core';
import { OriginConfigurationContext } from './OriginConfigurationContext';

export function getAddressDisplay(address: string, userOffchain?: IUser) {
    if (userOffchain) {
        return `${userOffchain?.firstName} ${userOffchain?.lastName}`;
    }

    return `${address.slice(0, 5)}...${address.slice(address.length - 3, address.length)}`;
}

const useStyles = makeStyles((theme: Theme) =>
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
        },
        tooltip: {
            backgroundColor: theme.palette.primary.main
        }
    })
);

export function Header() {
    const user = useSelector(getUserOffchain);

    const dispatch = useDispatch();
    const history = useHistory();

    const classes = useStyles(useTheme());

    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    const {
        getDefaultLink,
        getDevicesLink,
        getUserRegisterLink,
        getCertificatesLink,
        getAccountLink,
        getOrganizationLink,
        getAccountLoginLink,
        getAdminLink,
        getExchangeLink
    } = useLinks();

    const { enabledFeatures, logo } = useContext(OriginConfigurationContext);

    const { t } = useTranslation();

    return (
        <div className="HeaderWrapper">
            <div className="Header">
                <NavLink to={getDefaultLink()}>{logo}</NavLink>

                <ul className="NavMenu nav">
                    {enabledFeatures.includes(OriginFeature.Devices) && (
                        <li>
                            <NavLink to={getDevicesLink()}>{t('header.devices')}</NavLink>
                        </li>
                    )}

                    {((enabledFeatures.includes(OriginFeature.Certificates) &&
                        userIsActiveAndPartOfOrg) ||
                        isIssuer) && (
                        <li>
                            <NavLink to={getCertificatesLink()}>{t('header.certificates')}</NavLink>
                        </li>
                    )}

                    {enabledFeatures.includes(OriginFeature.Exchange) && (
                        <li>
                            <NavLink to={getExchangeLink()}>{'Exchange'}</NavLink>
                        </li>
                    )}

                    {isRole(user, Role.OrganizationAdmin, Role.Admin, Role.SupportAgent) && (
                        <>
                            <li>
                                <NavLink to={getOrganizationLink()}>
                                    {t('header.organizations')}
                                </NavLink>
                            </li>
                        </>
                    )}
                    {isRole(user, Role.Admin) && (
                        <>
                            <li>
                                <NavLink to={getAdminLink()}>{t('header.admin')}</NavLink>
                            </li>
                        </>
                    )}

                    {isRole(user, Role.SupportAgent) && (
                        <>
                            <li>
                                <NavLink to={getAdminLink()}>{t('header.supportAgent')}</NavLink>
                            </li>
                        </>
                    )}
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Grid item>
                        {t('settings.settings')}
                        &nbsp;
                        <Link
                            to={getAccountLink()}
                            className={classes.endIcon}
                            {...dataTest('header-link-account-settings')}
                        >
                            <Tooltip
                                title={t('settings.settings')}
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <Settings color="primary" />
                            </Tooltip>
                        </Link>
                        <br />
                    </Grid>
                    {!user && (
                        <Grid item>
                            &nbsp;
                            <Link className={classes.endIcon} to={getUserRegisterLink()}>
                                <Tooltip title={t('settings.registerOffchainUser')}>
                                    <PersonAdd color="primary" />
                                </Tooltip>
                                {t('user.actions.register')}
                            </Link>
                            <Typography color="primary" style={{ display: 'inline' }}>
                                {' '}
                                /
                            </Typography>
                            <Link to={getAccountLoginLink()} className={classes.endIcon}>
                                {t('user.actions.login')}
                                <Tooltip title={t('settings.navigation.login')}>
                                    <AccountCircle color="primary" />
                                </Tooltip>
                            </Link>
                        </Grid>
                    )}
                    {user && (
                        <div>
                            Logged in as: {user?.firstName} {user?.lastName}{' '}
                            <Tooltip title="Log out">
                                <ExitToApp
                                    color="primary"
                                    className={classes.logOutIcon}
                                    onClick={() => {
                                        history.push(getDefaultLink());
                                        dispatch(clearAuthenticationToken());
                                    }}
                                />
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
