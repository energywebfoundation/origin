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
    FormControl,
    InputLabel,
    Select,
    TextField,
    MenuItem,
    FilledInput
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { MarketUser } from '@energyweb/market';
import { Currency } from '@energyweb/utils-general';

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

const availableCurrencies = () => {
    let currencies = Object.keys(Currency);
    currencies = currencies.splice(Math.ceil(currencies.length / 2), currencies.length - 1);
    currencies = currencies.filter(curr => Currency[curr] !== Currency.NONE);

    return currencies;
};

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

    const autoPublish: MarketUser.IAutoPublishConfig = currentUser
        ? currentUser.offChainProperties.autoPublish
        : null;

    const [autoPublishCandidate, setAutoPublish] = useState(autoPublish);

    if (currentUser) {
        if (notificationsEnabled === null) {
            setNotificationsEnabled(userNotificationsEnabled);
        }

        if (userEmailCandidate === null) {
            setUserEmail(userEmail);
        }

        if (autoPublishCandidate === null) {
            setAutoPublish(autoPublish);
        }
    }

    const [marketLookupAddressCandidate, setMarketLookupAddressCandidate] = useState(
        marketLookupAddress
    );

    const emailChanged = userEmailCandidate !== userEmail;
    const notificationChanged = notificationsEnabled !== userNotificationsEnabled;
    const autoPublishChanged = autoPublishCandidate !== autoPublish;
    const contractChanged = marketLookupAddressCandidate !== marketLookupAddress;

    const propertiesChanged =
        notificationChanged || contractChanged || emailChanged || autoPublishChanged;

    async function saveChanges() {
        if (!propertiesChanged) {
            showNotification(`No changes have been made.`, NotificationType.Error);

            return;
        }

        if (emailChanged || notificationChanged || autoPublishChanged) {
            const newProperties: MarketUser.IMarketUserOffChainProperties =
                currentUser.offChainProperties;

            newProperties.email = emailChanged ? userEmailCandidate : newProperties.email;
            newProperties.notifications = notificationsEnabled;
            newProperties.autoPublish = autoPublishChanged
                ? autoPublishCandidate
                : newProperties.autoPublish;

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

    const autoPublishEnabled = false;

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

                            {autoPublishCandidate !== null && autoPublishEnabled && (
                                <div>
                                    <hr />
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <PurpleSwitch
                                                    checked={autoPublishCandidate.enabled}
                                                    onChange={(e, checked) =>
                                                        setAutoPublish({
                                                            ...autoPublishCandidate,
                                                            enabled: checked
                                                        })
                                                    }
                                                />
                                            }
                                            label="Automatically post certificates for sale"
                                        />
                                    </FormGroup>

                                    {autoPublishCandidate.enabled && (
                                        <div>
                                            <TextField
                                                label="Price"
                                                value={autoPublishCandidate.price}
                                                type="number"
                                                placeholder="1"
                                                onChange={e =>
                                                    setAutoPublish({
                                                        ...autoPublishCandidate,
                                                        price: parseFloat(e.target.value)
                                                    })
                                                }
                                                id="priceInput"
                                                fullWidth
                                            />

                                            <FormControl fullWidth={true} variant="filled">
                                                <InputLabel>Currency</InputLabel>
                                                <Select
                                                    value={Currency[autoPublishCandidate.currency]}
                                                    onChange={e =>
                                                        setAutoPublish({
                                                            ...autoPublishCandidate,
                                                            currency:
                                                                Currency[e.target.value as string]
                                                        })
                                                    }
                                                    fullWidth
                                                    variant="filled"
                                                    input={<FilledInput />}
                                                >
                                                    {availableCurrencies().map(currency => (
                                                        <MenuItem key={currency} value={currency}>
                                                            {currency}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    )}
                                </div>
                            )}

                            <hr />
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
