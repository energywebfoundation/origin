import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  owned: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));
