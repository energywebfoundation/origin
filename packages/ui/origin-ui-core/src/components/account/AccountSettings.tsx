import React, { useState, useContext, useEffect, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
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
    MenuItem
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AVAILABLE_ORIGIN_LANGUAGES, ORIGIN_LANGUAGE } from '@energyweb/localization';
import { showNotification, NotificationTypeEnum } from '../../utils';
import { OriginConfigurationContext, setOriginLanguage } from '../../PackageConfigurationProvider';
import { fromGeneralSelectors, fromUsersActions, fromUsersSelectors } from '../../features';

export const AccountSettings = (): ReactElement => {
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

    const theme = useStyles(useTheme());

    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const userClient = useSelector(fromGeneralSelectors.getBackendClient)?.userClient;

    const [notificationsEnabled, setNotificationsEnabled] = useState(null);

    const userNotificationsEnabled = user?.notifications ?? null;

    useEffect(() => {
        if (notificationsEnabled === null) {
            setNotificationsEnabled(userNotificationsEnabled);
        }
    }, [user]);

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

    const notificationChanged = notificationsEnabled !== userNotificationsEnabled;

    const propertiesChanged = notificationChanged;

    async function saveChanges() {
        if (!propertiesChanged) {
            showNotification(t('general.feedback.noChangesMade'), NotificationTypeEnum.Error);

            return;
        }

        if (notificationChanged) {
            await userClient.updateOwnUserSettings({ notifications: notificationsEnabled });
        }

        dispatch(fromUsersActions.refreshUserOffchain());

        showNotification(t('settings.feedback.userSettingsUpdated'), NotificationTypeEnum.Success);
    }

    return (
        <Paper>
            <Grid container spacing={3} className={theme.container}>
                <Grid item xs={12}>
                    {user && (
                        <>
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
                                    label={t('settings.properties.notifications')}
                                />
                            </FormGroup>

                            <Button
                                onClick={saveChanges}
                                color="primary"
                                disabled={!propertiesChanged}
                            >
                                {t('general.actions.update')}
                            </Button>
                        </>
                    )}
                    <FormControl fullWidth>
                        <InputLabel>{t('settings.properties.language')}</InputLabel>
                        <Select
                            data-cy="language-select"
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
};
