import React, { FC } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
} from '@material-ui/core';
import { useStyles } from './SettingsPage.styles';
import { useSettingsPageEffects } from './SettingsPage.effects';

export const SettingsPage: FC = () => {
  const classes = useStyles();
  const {
    notificationsEnabled,
    language,
    handleNotificationsChange,
    handleLanguageChange,
    handleUpdateLanguage,
    notificationsLabel,
    languageLabel,
    languageOptions,
    buttonText,
  } = useSettingsPageEffects();

  return (
    <Paper className={classes.paper}>
      <Box width={1}>
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={notificationsEnabled}
              onChange={handleNotificationsChange}
              name="notifications"
            />
          }
          label={notificationsLabel}
        />
      </Box>
      <Box width={0.3}>
        <FormControl fullWidth>
          <InputLabel>{languageLabel}</InputLabel>
          <Select
            value={language}
            onChange={handleLanguageChange}
            name="language"
          >
            {languageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          className={classes.button}
          onClick={handleUpdateLanguage}
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );
};
