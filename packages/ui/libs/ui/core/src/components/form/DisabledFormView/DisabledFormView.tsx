import React, { FC } from 'react';
import {
  Grid,
  Paper,
  TextField,
  TextFieldProps,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import { useStyles } from './DisabledFormView.styles';

export type DisabledFormData = {
  label: string;
  value: string | number;
};

export interface DisabledFormViewProps {
  data: DisabledFormData[];
  heading?: string;
  inputProps?: TextFieldProps;
  headingProps?: TypographyProps;
  paperClass?: string;
}

export const DisabledFormView: FC<DisabledFormViewProps> = ({
  data,
  heading,
  inputProps,
  headingProps,
  paperClass,
}) => {
  const classes = useStyles();

  const firstSliceRange = Math.ceil(data?.length / 2);
  const firstColumn = data?.slice(0, firstSliceRange);
  const secondColumn = data?.slice(firstSliceRange, data.length);

  if (!data) {
    return <></>;
  }

  return (
    <Paper classes={{ root: paperClass ?? classes.paper }}>
      {heading && (
        <Typography variant="h6" {...headingProps}>
          {heading}
        </Typography>
      )}
      <Grid container spacing={1}>
        <Grid item sm={12} lg={6}>
          {firstColumn.map((item) => (
            <TextField
              key={item.label}
              label={item.label}
              value={item.value}
              fullWidth
              disabled
              variant="standard"
              classes={{ root: classes.input }}
              {...inputProps}
            />
          ))}
        </Grid>
        <Grid item sm={12} lg={6}>
          {secondColumn.map((item) => (
            <TextField
              key={item.label}
              label={item.label}
              value={item.value}
              variant="standard"
              fullWidth
              disabled
              classes={{ root: classes.input }}
              {...inputProps}
            />
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};
