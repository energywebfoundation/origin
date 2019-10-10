import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { AccountCircle, VpnKeySharp, Lock, Settings } from '@material-ui/icons';
import './Header.scss';
import { useSelector, useDispatch } from 'react-redux';
import { getBaseURL } from '../features/selectors';
import {
    getAssetsLink,
    getCertificatesLink,
    getDemandsLink,
    getAccountLink
} from '../utils/routing';
import { getUserById, getUsers } from '../features/users/selectors';
import {
    isUsingInBrowserPK,
    getAccounts,
    getActiveAccount,
    getEncryptedAccounts
} from '../features/authentication/selectors';
import {
    makeStyles,
    createStyles,
    useTheme,
    Select,
    MenuItem,
    FilledInput
} from '@material-ui/core';
import { requestUser } from '../features/users/actions';
import { setActiveAccount, unlockAccount } from '../features/authentication/actions';
import { showRequestPasswordModal } from '../features/general/actions';

const useStyles = makeStyles(() =>
    createStyles({
        icon: {
            opacity: 0.3,
            fontSize: '16px',
            marginLeft: '8px'
        },
        settingsIcon: {
            opacity: 0.7,
            fontSize: '16px',
            marginLeft: '8px'
        }
    })
);

export function Header() {
    const baseURL = useSelector(getBaseURL);
    const isUsingPK = useSelector(isUsingInBrowserPK);
    const accounts = useSelector(getAccounts);
    const users = useSelector(getUsers);
    const encryptedAccounts = useSelector(getEncryptedAccounts);

    const dispatch = useDispatch();

    const classes = useStyles(useTheme());

    const privateKeyIndicator = <VpnKeySharp className={classes.icon} />;

    const selectorAccounts = accounts.map(a => {
        const user = getUserById(users, a.address);

        if (!user) {
            dispatch(requestUser(a.address));
        }

        return {
            id: `${a.address}${a.privateKey ? 'PK' : ''}`,
            value: a.address,
            label: (user && user.organization) || 'Guest',
            isPrivateKey: Boolean(a.privateKey),
            isLocked: false
        };
    });

    encryptedAccounts.map(a => {
        if (
            selectorAccounts.find(
                selectorAccount =>
                    selectorAccount.value === a.address && selectorAccount.isPrivateKey === true
            )
        ) {
            return;
        }

        const user = getUserById(users, a.address);

        if (!user) {
            dispatch(requestUser(a.address));
        }

        selectorAccounts.push({
            id: `${a.address}PK`,
            value: a.address,
            label: (user && user.organization) || 'Guest',
            isPrivateKey: true,
            isLocked: true
        });
    });

    const handleChange = (id: string) => {
        const selectedAccount = selectorAccounts.find(a => a.id === id);
        const address = id.includes('PK') ? id.slice(0, id.length - 2) : id;

        if (selectedAccount.isLocked) {
            dispatch(
                showRequestPasswordModal((password: string) => {
                    dispatch(
                        unlockAccount({
                            address,
                            password
                        })
                    );
                })
            );
        } else {
            const account = accounts.find(
                a =>
                    a.address === address &&
                    (selectedAccount.isPrivateKey ? a.privateKey : !a.privateKey)
            );

            if (account) {
                dispatch(setActiveAccount(account));
            }
        }
    };

    const activeAccount = useSelector(getActiveAccount);

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

                <div className="ViewProfile">
                    <Select
                        input={<FilledInput value={activeAccount ? activeAccount.address : ''} />}
                        renderValue={(selected: string) => {
                            const selectedAccount = selectorAccounts.find(
                                a => a.value === selected
                            );

                            return (
                                <>
                                    <AccountCircle className="ViewProfile_icon" color="primary" />
                                    {selectedAccount.label}
                                    {isUsingPK && privateKeyIndicator}
                                </>
                            );
                        }}
                        startAdornment={<></>}
                        onChange={e => handleChange(e.target.value as string)}
                    >
                        {selectorAccounts.map(a => (
                            <MenuItem value={a.id} key={a.id}>
                                {a.label}
                                {a.isPrivateKey ? privateKeyIndicator : ' (MetaMask)'}
                                {a.isLocked && <Lock className={classes.icon} />}
                            </MenuItem>
                        ))}
                    </Select>
                    &nbsp;
                    <Link to={getAccountLink(baseURL)} className={classes.settingsIcon}>
                        <Settings color="primary" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
