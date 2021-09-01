import React, { FC, SVGProps } from 'react';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  icon: {
    fill: theme?.palette?.primary?.main,
  },
}));

export const withPrimaryColor = (
  Component: FC<SVGProps<SVGSVGElement> & { title?: string }>
) => {
  const ComponentPrimaryColored = (
    props: SVGProps<SVGSVGElement> & { title?: string }
  ) => {
    const classes = useStyles();
    const { className, ...restProps } = props;
    return (
      <Component className={clsx(classes.icon, className)} {...restProps} />
    );
  };

  return ComponentPrimaryColored;
};
