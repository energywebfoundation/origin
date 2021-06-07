import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  gridContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  fieldWrapper: {
    width: '100%',
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
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
  },
});
