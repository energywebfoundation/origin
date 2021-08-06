import React, { FC } from 'react';
import {
  Paper,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
} from '@material-ui/core';
import { IPermissionRule } from '@energyweb/origin-ui-utils';
import { useStyles } from './Requirements.styles';

export interface RequirementsProps {
  accessRules: IPermissionRule[];
  title: string;
  loading: boolean;
}

export const Requirements: FC<RequirementsProps> = ({
  accessRules,
  title,
  loading,
}): JSX.Element => {
  const classes = useStyles();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper className={classes?.container}>
      <Typography variant="body1" className="mt-3" gutterBottom>
        {title}
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
    </Paper>
  );
};
