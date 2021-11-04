import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
  popoverTextBlock: {
    padding: '10px',
  },
  popoverPaper: {
    width: '30%',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
  },
}));
