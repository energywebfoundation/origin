import { makeStyles } from '@material-ui/styles';

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
