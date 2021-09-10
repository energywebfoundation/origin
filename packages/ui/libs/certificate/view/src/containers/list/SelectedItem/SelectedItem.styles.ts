import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  block: {
    backgroundColor: LightenColor(
      theme.palette.background.paper,
      7,
      theme.palette.mode
    ),
    padding: 10,
    marginBottom: 10,
  },
  wrapper: {
    width: '100%',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'space-between',
      margin: '5px 0',
    },
  },
  icon: {
    width: 30,
    marginRight: 15,
  },
  editForm: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    margin: 10,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  editField: {
    marginRight: 15,
  },
  editButton: {
    marginRight: 15,
    [theme.breakpoints.down('sm')]: {
      marginTop: 10,
      marginRight: 0,
    },
  },
}));
