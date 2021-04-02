import React, { ReactNode } from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import makeOriginUiTheme from '../utils/makeOriginUiTheme';

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider(props: ThemeProviderProps) {
  return <MuiThemeProvider theme={makeOriginUiTheme()} />;
}

export default ThemeProvider;
