import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  hover: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));
