import React, { useState, useContext, useEffect } from 'react';
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
import { withStyles } from '@material-ui/core/styles';

import { signTypedMessage } from '@energyweb/utils-general';
import { MarketUser } from '@energyweb/market';

import { showNotification, NotificationType } from '../../utils/notifications';
import { getMarketContractLookupAddress } from '../../features/contracts/selectors';
import { getCurrencies, getOffChainDataSource, getEnvironment } from '../../features/general/selectors';
import { getCurrentUser, getUserOffchain, getCurrentUserId } from '../../features/users/selectors';
import { setMarketContractLookupAddress } from '../../features/contracts/actions';
import { OriginConfigurationContext } from '../OriginConfigurationContext';
import { getWeb3 } from '../../features/selectors';
import { refreshUserOffchain } from '../../features/users/actions';
import { getActiveAccount, isUsingInBrowserPK } from '../../features/authentication/selectors';

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
    const userOffchain = useSelector(getUserOffchain);
    const currencies = useSelector(getCurrencies);
    const userClient = useSelector(getOffChainDataSource).userClient;
    const web3 = useSelector(getWeb3);
    const currentUserId = useSelector(getCurrentUserId);
    const usingPK = useSelector(isUsingInBrowserPK);
    const activeAccount = useSelector(getActiveAccount);
    const environment = useSelector(getEnvironment);

    const [marketLookupAddressCandidate, setMarketLookupAddressCandidate] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(null);

    useEffect(() => {
        if (marketLookupAddressCandidate !== marketLookupAddress) {
            setMarketLookupAddressCandidate(marketLookupAddress);
        }
    }, [marketLookupAddress]);

    const userNotificationsEnabled = currentUser?.offChainProperties.notifications ?? false;
    const autoPublish = currentUser?.offChainProperties?.autoPublish ?? null;

    const [autoPublishCandidate, setAutoPublish] = useState(autoPublish);

    if (currentUser) {
        if (notificationsEnabled === null) {
            setNotificationsEnabled(userNotificationsEnabled);
        }

        if (autoPublishCandidate === null) {
            setAutoPublish(autoPublish);
        }
    }

    const originConfiguration = useContext(OriginConfigurationContext);

    const PurpleSwitch = withStyles({
        switchBase: {
            color: originConfiguration.styleConfig.PRIMARY_COLOR,
            '&$checked': {
                color: originConfiguration.styleConfig.PRIMARY_COLOR
            },
            '&$checked + $track': {
                backgroundColor: originConfiguration.styleConfig.PRIMARY_COLOR
            }
        },
        checked: {},
        track: {}
    })(Switch);

    const notificationChanged = currentUser && notificationsEnabled !== userNotificationsEnabled;
    const autoPublishChanged = currentUser && autoPublishCandidate !== autoPublish;
    const contractChanged = marketLookupAddressCandidate !== marketLookupAddress;

    const propertiesChanged = notificationChanged || contractChanged || autoPublishChanged;

    async function saveChanges() {
        if (!propertiesChanged) {
            showNotification(`No changes have been made.`, NotificationType.Error);

            return;
        }

        if (notificationChanged || autoPublishChanged) {
            const newProperties: MarketUser.IMarketUserOffChainProperties =
                currentUser.offChainProperties;

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

    async function signAndSend(): Promise<void> {
        try {
            const signedMessage = await signTypedMessage(
                currentUserId,
                environment.REGISTRATION_MESSAGE_TO_SIGN,
                web3,
                usingPK ? activeAccount?.privateKey : null
            );

            await userClient.attachSignedMessage(userOffchain.id, signedMessage);

            dispatch(refreshUserOffchain());

            showNotification('Blockchain account linked.', NotificationType.Success);
        } catch (error) {
            if (error?.response?.data?.message) {
                showNotification(error?.response?.data?.message, NotificationType.Error);
            } else {
                console.warn('Could not log in.', error);
                showNotification('Unknown error', NotificationType.Error);
            }
        }
    }

    return (
        <Paper>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    {userOffchain && (
                        <>
                            {`${userOffchain.title} ${userOffchain.firstName} ${userOffchain.lastName}`}

                            {userOffchain.organization && (
                                <>
                                    <br />
                                    <br />
                                    Organization: {userOffchain.organization.name}
                                </>
                            )}

                            <TextField
                                label="E-mail"
                                value={userOffchain.email}
                                fullWidth
                                className="my-3"
                                disabled
                            />

                            <TextField
                                label="Blockchain account"
                                value={userOffchain.blockchainAccountAddress}
                                fullWidth
                                className="my-3"
                                disabled
                            />

                            {!userOffchain.blockchainAccountAddress && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    onClick={signAndSend}
                                >
                                    Verify blockchain account
                                </Button>
                            )}
                        </>
                    )}
                    {currentUser && (
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <PurpleSwitch
                                        checked={notificationsEnabled}
                                        onChange={(e, checked) => setNotificationsEnabled(checked)}
                                    />
                                }
                                label="Notifications"
                            />
                        </FormGroup>
                    )}
                    {currentUser && autoPublishCandidate !== null && (
                        <>
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
                                            value={autoPublishCandidate.priceInCents / 100}
                                            type="number"
                                            placeholder="1"
                                            onChange={e =>
                                                setAutoPublish({
                                                    ...autoPublishCandidate,
                                                    priceInCents: parseFloat(e.target.value) * 100
                                                })
                                            }
                                            id="priceInput"
                                            fullWidth
                                        />

                                        <FormControl fullWidth={true} variant="filled">
                                            <InputLabel>Currency</InputLabel>
                                            <Select
                                                value={autoPublishCandidate.currency}
                                                onChange={e =>
                                                    setAutoPublish({
                                                        ...autoPublishCandidate,
                                                        currency: e.target.value as string
                                                    })
                                                }
                                                fullWidth
                                                variant="filled"
                                                input={<FilledInput />}
                                            >
                                                {currencies.map(currency => (
                                                    <MenuItem key={currency} value={currency}>
                                                        {currency}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                )}
                            </div>
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
