import { LightenColor } from '@energyweb/origin-ui-theme';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
  },
  dropzoneText: {
    fontFamily: theme.typography.fontFamily,
  },
  dropzone: {
    cursor: 'pointer',
    background: LightenColor(
      theme.palette.background.paper,
      -1,
      theme.palette.mode
    ),
    minHeight: '250px',
    lineHeight: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.text.primary,
    marginTop: '20px',
  },
  chipsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
}));
