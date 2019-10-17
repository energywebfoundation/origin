import React, { useState } from 'react';
import {
    Paper,
    Grid,
    makeStyles,
    createStyles,
    useTheme,
    Button,
    Switch,
    FormControlLabel,
    FormGroup,
    TextField
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { User } from '@energyweb/user-registry';

import { withStyles } from '@material-ui/core/styles';
import { showNotification, NotificationType } from '../../utils/notifications';
import { STYLE_CONFIG } from '../../styles/styleConfig';

import { getMarketContractLookupAddress } from '../../features/contracts/selectors';
import { getCurrentUser } from '../../features/users/selectors';
import { setMarketContractLookupAddress } from '../../features/contracts/actions';

const PurpleSwitch = withStyles({
    switchBase: {
        color: STYLE_CONFIG.PRIMARY_COLOR,
        '&$checked': {
            color: STYLE_CONFIG.PRIMARY_COLOR
        },
        '&$checked + $track': {
            backgroundColor: STYLE_CONFIG.PRIMARY_COLOR
        }
    },
    checked: {},
    track: {}
})(Switch);

export function AccountSettings() {
    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            },
            button: {
                marginTop: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const currentUser = useSelector(getCurrentUser);

    const marketLookupAddress = useSelector(getMarketContractLookupAddress);

    const userEmail = currentUser ? currentUser.offChainProperties.email : null;

    const [userEmailCandidate, setUserEmail] = useState(userEmail);

    const userNotificationsEnabled = currentUser
        ? currentUser.offChainProperties.notifications
        : false;

    const [notificationsEnabled, setNotificationsEnabled] = useState(null);

    if (currentUser) {
        if (notificationsEnabled === null) {
            setNotificationsEnabled(userNotificationsEnabled);
        }

        if (userEmailCandidate === null) {
            setUserEmail(userEmail);
        }
    }

    const [marketLookupAddressCandidate, setMarketLookupAddressCandidate] = useState(
        marketLookupAddress
    );

    const emailChanged = userEmailCandidate !== userEmail;
    const notificationChanged = notificationsEnabled !== userNotificationsEnabled;
    const contractChanged = marketLookupAddressCandidate !== marketLookupAddress;

    const propertiesChanged = notificationChanged || contractChanged || emailChanged;

    async function saveChanges() {
        if (!propertiesChanged) {
            showNotification(`No changes have been made.`, NotificationType.Error);

            return;
        }

        if (emailChanged) {
            const newProperties: User.IUserOffChainProperties = currentUser.offChainProperties;
            newProperties.email = userEmailCandidate;

            await currentUser.update(newProperties);
        }

        if (notificationChanged) {
            const newProperties: User.IUserOffChainProperties = currentUser.offChainProperties;
            newProperties.notifications = notificationsEnabled;

            await currentUser.update(newProperties);
        }

        if (contractChanged) {
            dispatch(
                setMarketContractLookupAddress({
                    address: marketLookupAddressCandidate,
                    userDefined: true
                })
            );
        }

        showNotification(`User settings have been updated.`, NotificationType.Success);
    }

    return (
        <Paper>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    {currentUser && (
                        <>
                            {currentUser.organization}

                            <TextField
                                label="E-mail"
                                value={userEmailCandidate}
                                onChange={e => setUserEmail(e.target.value)}
                                fullWidth
                                className="my-3"
                            />
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <PurpleSwitch
                                            checked={notificationsEnabled}
                                            onChange={(e, checked) =>
                                                setNotificationsEnabled(checked)
                                            }
                                        />
                                    }
                                    label="Notifications"
                                />
                            </FormGroup>
                        </>
                    )}
                    <TextField
                        label="Market Lookup Address"
                        value={marketLookupAddressCandidate}
                        onChange={e => setMarketLookupAddressCandidate(e.target.value)}
                        fullWidth
                        className="my-3"
                    />

                    <Button onClick={saveChanges} color="primary" disabled={!propertiesChanged}>
                        Update
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
