import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  buttonGroup: {
    marginBottom: 20,
    '& .MuiToggleButtonGroup-grouped': {
      margin: '0 10px',
      [theme.breakpoints.down('sm')]: {
        margin: '0 5px',
      },
    },
  },
  button: {
    borderRadius: 15,
    border: 'none',
    padding: '5px 15px',
    '&.MuiToggleButtonGroup-grouped:not(:last-of-type)': {
      borderRadius: 15,
    },
    '&.MuiToggleButtonGroup-grouped:not(:first-of-type)': {
      borderRadius: 15,
    },
    '&.Mui-selected, &.Mui-selected:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));
