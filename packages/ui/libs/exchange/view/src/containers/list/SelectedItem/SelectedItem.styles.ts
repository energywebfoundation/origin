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
  },
  item: {
    display: 'flex',
    alignItems: 'center',
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
  },
  editField: {
    marginRight: 15,
  },
  editButton: {
    marginRight: 15,
  },
}));
