import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles<Theme, { exchangeAddressExists: boolean }>(
  (theme) => ({
    gridContainer: {
      paddingTop: 20,
      paddingBottom: 20,
      display: ({ exchangeAddressExists }) =>
        exchangeAddressExists ? 'block' : 'flex',
      alignItems: 'center',
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
  })
);
