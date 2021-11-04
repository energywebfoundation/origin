import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
  text: {
    color: '#000',
  },
  link: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});
