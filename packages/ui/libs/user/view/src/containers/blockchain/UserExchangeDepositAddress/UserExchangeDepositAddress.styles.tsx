import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  gridContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  fieldWrapper: {
    width: '100%',
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column-reverse',
    },
  },
  field: {
    width: '100%',
  },
  loader: {
    transition: 'all 0.2s linear',
    marginLeft: 10,
  },
  iconPopover: {
    marginLeft: 20,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginBottom: 10,
    },
  },
}));
