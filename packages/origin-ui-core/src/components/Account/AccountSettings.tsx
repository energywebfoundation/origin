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
    MenuItem
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { signTypedMessage } from '@energyweb/utils-general';
import { AVAILABLE_ORIGIN_LANGUAGES, ORIGIN_LANGUAGE } from '@energyweb/localization';

import { showNotification, NotificationType, useTranslation } from '../../utils';
import { getOffChainDataSource, getEnvironment } from '../../features/general/selectors';
import { getUserOffchain, getActiveBlockchainAccountAddress } from '../../features/users/selectors';
import { OriginConfigurationContext, setOriginLanguage } from '../OriginConfigurationContext';
import { getWeb3 } from '../../features/selectors';
import { refreshUserOffchain } from '../../features/users/actions';
import { IUserProperties } from '@energyweb/origin-backend-core';

export function AccountSettings() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

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

    const user = useSelector(getUserOffchain);
    const userClient = useSelector(getOffChainDataSource)?.userClient;
    const web3 = useSelector(getWeb3);
    const activeBlockchainAccountAddress = useSelector(getActiveBlockchainAccountAddress);
    const environment = useSelector(getEnvironment);

    const [notificationsEnabled, setNotificationsEnabled] = useState(null);

    const userNotificationsEnabled = user?.notifications ?? null;

    useEffect(() => {
        if (notificationsEnabled === null) {
            setNotificationsEnabled(userNotificationsEnabled);
        }
    }, [user]);

    const originConfiguration = useContext(OriginConfigurationContext);

    if (!user) {
        return null;
    }

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

    const notificationChanged = notificationsEnabled !== userNotificationsEnabled;

    const propertiesChanged = notificationChanged;

    async function saveChanges() {
        if (!propertiesChanged) {
            showNotification(t('general.feedback.noChangesMade'), NotificationType.Error);

            return;
        }

        if (notificationChanged) {
            const newProperties: Partial<IUserProperties> = {};

            if (notificationChanged) {
                newProperties.notifications = notificationsEnabled;
            }

            await userClient.updateAdditionalProperties(newProperties);
        }

        dispatch(refreshUserOffchain());

        showNotification(t('settings.feedback.userSettingsUpdated'), NotificationType.Success);
    }

    async function signAndSend(): Promise<void> {
        try {
            const signedMessage = await signTypedMessage(
                activeBlockchainAccountAddress,
                environment.REGISTRATION_MESSAGE_TO_SIGN,
                web3
            );

            await userClient.attachSignedMessage(signedMessage);

            dispatch(refreshUserOffchain());

            showNotification(
                t('settings.feedback.blockchainAccountLinked'),
                NotificationType.Success
            );
        } catch (error) {
            if (error?.response?.data?.message) {
                showNotification(error?.response?.data?.message, NotificationType.Error);
            } else {
                console.warn('Could not log in.', error);
                showNotification(t('general.feedback.unknownError'), NotificationType.Error);
            }
        }
    }

    return (
        <Paper>
            <Grid container spacing={3} className={classes.container}>
                <Grid item xs={12}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <PurpleSwitch
                                    checked={notificationsEnabled}
                                    onChange={(e, checked) => setNotificationsEnabled(checked)}
                                />
                            }
                            label={t('settings.properties.notifications')}
                        />
                    </FormGroup>

                    <Button onClick={saveChanges} color="primary" disabled={!propertiesChanged}>
                        {t('general.actions.update')}
                    </Button>
                    <FormControl fullWidth>
                        <InputLabel>{t('settings.properties.language')}</InputLabel>
                        <Select
                            value={originConfiguration.language}
                            onChange={(e) => setOriginLanguage(e.target.value as ORIGIN_LANGUAGE)}
                        >
                            {AVAILABLE_ORIGIN_LANGUAGES.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
}
