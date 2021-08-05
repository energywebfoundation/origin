import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPermissionRule } from '@energyweb/origin-ui-utils';
import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
} from '@material-ui/core';

interface IProps {
  accessRules: IPermissionRule[];
}

export const PermissionsFeedback = memo(({ accessRules }: IProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="body1" className="mt-3" gutterBottom>
        {t('general.requirements.requirementsTitle')}
      </Typography>
      <List>
        {accessRules?.map((rule) => (
          <ListItem key={rule.label} role={undefined} dense>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={rule.passing}
                tabIndex={-1}
                disableRipple
                disabled
              />
            </ListItemIcon>
            <ListItemText primary={rule.label} />
          </ListItem>
        ))}
      </List>
    </>
  );
});
