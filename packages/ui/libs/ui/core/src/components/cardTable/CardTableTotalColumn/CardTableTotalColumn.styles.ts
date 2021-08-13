import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: 0,
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  tableHeadCell: {
    width: 210,
    height: 90,
    position: 'sticky',
    top: 0,
    padding: 0,
    border: `1px solid ${theme.palette.grey[400]}`,
    [theme.breakpoints.down('md')]: {
      width: 190,
      height: 80,
    },
    [theme.breakpoints.down('sm')]: {
      width: 100,
      height: 40,
    },
  },
  tableCell: {
    width: 210,
    height: 120,
    padding: 0,
    border: `1px solid ${theme.palette.grey[400]}`,
    [theme.breakpoints.down('md')]: {
      width: 190,
      height: 105,
    },
    [theme.breakpoints.down('sm')]: {
      width: 100,
      height: 60,
    },
  },
  totalCellWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
