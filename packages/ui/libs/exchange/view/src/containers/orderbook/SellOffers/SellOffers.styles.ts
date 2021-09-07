import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  owned: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));
