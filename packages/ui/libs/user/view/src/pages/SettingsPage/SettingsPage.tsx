import React, { FC } from 'react';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Grid,
} from '@mui/material';
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
      <Grid container>
        <Grid item xs={12}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={4} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ ml: -2 }}>{languageLabel}</InputLabel>
            <Select
              value={language}
              onChange={handleLanguageChange}
              name="language"
              variant="standard"
              data-cy="languageSelect"
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
            data-cy="updateLanguage"
          >
            {buttonText}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SettingsPage;
