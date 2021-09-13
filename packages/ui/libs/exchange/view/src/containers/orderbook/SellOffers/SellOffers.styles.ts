import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles((theme) => ({
  owned: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));
