import { makeStyles } from '@mui/styles';

// to skip ts-errors while doing roll-up build of package
export const useStyles = makeStyles<any, { exchangeAddressExists: boolean }>(
  (theme) => ({
    gridContainer: {
      paddingTop: 20,
      paddingBottom: 20,
      // to skip ts-errors while doing roll-up build of package
      display: ({
        exchangeAddressExists,
      }: {
        exchangeAddressExists: boolean;
      }) => (exchangeAddressExists ? 'block' : 'flex'),
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
