import { makeStyles } from '@material-ui/core';
import { HexToRGBA, LightenColor } from '@energyweb/origin-ui-theme';

export const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiPickerView-root': {
      width: 250,
    },
    '& .MuiPickersCalendar': {
      '&-root': {
        minHeight: 205,
      },
      '&-daysHeader': {
        '& .MuiPickersCalendar-weekDayLabel': {
          lineHeight: '30px',
          fontWeight: 600,
          fontSize: 10,
          width: 20,
          height: 20,
          margin: 5,
        },
      },
    },
    '& .MuiPickersCalendarHeader': {
      '&-root': {
        maxHeight: 'initial',
        minHeight: 'initial',
        margin: '18px 0 17px 0',
        paddingLeft: 28,
      },
      '&-label': {
        fontSize: 14,
        fontWeight: 600,
        color: theme.palette.primary.main,
        lineHeight: '17px',
        letterSpacing: '0.33px',
      },
      '&-yearSelectionSwitcher': {
        display: 'none',
      },
    },
    '& .MuiPickersArrowSwitcher': {
      '&-root': {
        paddingRight: 15,
      },
      '&-spacer': {
        width: 7,
      },
    },
    '& .MuiPickersDay': {
      '&-root': {
        fontSize: 10,
        width: 20,
        height: 20,
        margin: 5,
        '&.Mui-selected': {
          backgroundColor: LightenColor(theme.palette.primary.main, 10),
        },
      },
      '&-today:not(.Mui-selected)': {
        border: `1px solid ${theme.palette.text.primary}`,
      },
    },
  },
  popper: {
    zIndex: theme.zIndex.modal + 1,
    '& .MuiPickersPopper-paper': {
      boxShadow: `1px 2px 4px ${HexToRGBA(theme.palette.common.black, 20)}`,
      borderRadius: 5,
    },
  },
  dialog: {
    zIndex: theme.zIndex.modal + 1,
    '& .MuiPicker-root': {
      paddingTop: 44,
    },
  },
  clearButtonWrapper: {
    width: 45,
    flexShrink: 0,
  },
  clearButton: {
    opacity: 0,
  },
  input: {
    [theme.breakpoints.up('md')]: {
      '&:hover button': {
        opacity: 1,
      },
    },
  },
}));
