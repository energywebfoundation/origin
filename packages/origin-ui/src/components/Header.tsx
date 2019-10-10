import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { AccountCircle, VpnKeySharp } from '@material-ui/icons';
import './Header.scss';
import { useSelector } from 'react-redux';
import { getBaseURL } from '../features/selectors';
import {
    getAssetsLink,
    getCertificatesLink,
    getDemandsLink,
    getAccountLink
} from '../utils/routing';
import { getCurrentUser } from '../features/users/selectors';
import { isUsingInBrowserPK } from '../features/authentication/selectors';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';

const useStyles = makeStyles(() =>
    createStyles({
        privateKeyIcon: {
            opacity: 0.3,
            fontSize: '16px',
            marginLeft: '8px'
        }
    })
);

export function Header() {
    const baseURL = useSelector(getBaseURL);
    const currentUser = useSelector(getCurrentUser);
    const isUsingPK = useSelector(isUsingInBrowserPK);

    const classes = useStyles(useTheme());

    return (
        <div className="HeaderWrapper">
            <div className="Header">
                <NavLink to={getAssetsLink(baseURL)}>
                    <img src={logo} />
                </NavLink>
                <ul className="NavMenu nav">
                    <li>
                        <NavLink to={getAssetsLink(baseURL)}>Assets</NavLink>
                    </li>
                    <li>
                        <NavLink to={getCertificatesLink(baseURL)}>Certificates</NavLink>
                    </li>
                    <li>
                        <NavLink to={getDemandsLink(baseURL)}>Demands</NavLink>
                    </li>
                </ul>

                <Link className="ViewProfile" to={getAccountLink(baseURL)}>
                    <AccountCircle className="ViewProfile_icon" color="primary" />
                    {currentUser ? currentUser.organization : 'Guest'}

                    {isUsingPK && (
                        <>
                            &nbsp;
                            <VpnKeySharp className={classes.privateKeyIcon} />
                        </>
                    )}
                </Link>
            </div>
        </div>
    );
}
