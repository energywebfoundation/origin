import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
} from '@material-ui/core';
import { useStyles } from './UserSettingsPage.styles';
import { useTranslation } from 'react-i18next';
import { SupportedLanguagesEnum } from '@energyweb/origin-ui-localization';

/* eslint-disable-next-line */
export interface UserSettingsPageProps {}

export function UserSettingsPage() {
  const classes = useStyles();
  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    SupportedLanguagesEnum.en
  );
  const { t } = useTranslation();

  return (
    <Paper className={classes.paper}>
      <Box width={1}>
        <FormControlLabel
          control={
            <Switch
              checked={areNotificationsEnabled}
              onChange={(event) =>
                setAreNotificationsEnabled(event.target.checked)
              }
              name="notifications"
            />
          }
          label={t('account.settings.notifications')}
        />
      </Box>
      <Box width={1}>
        <FormControl fullWidth>
          <InputLabel>{t('account.settings.language')}</InputLabel>
          <Select
            value={selectedLanguage}
            onChange={(event) =>
              setSelectedLanguage(event.target.value as string)
            }
            name="language"
          >
            {Object.entries(SupportedLanguagesEnum).map(([key, val]) => (
              <MenuItem key={key} value={val}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}

export default UserSettingsPage;
