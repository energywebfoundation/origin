import { Button, Typography, useTheme, useMediaQuery } from '@material-ui/core';
import React, { FC, PropsWithChildren, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyles } from './ListItemContent.styles';

export interface ListItemContentProps<Id> {
  certificateId: Id;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  fuelType: string;
  energy: string;
  generationTimeTitle: string;
  generationTimeText: string;
  viewButtonLabel: string;
}

export type TListItemContent = <Id>(
  props: PropsWithChildren<ListItemContentProps<Id>>
) => ReactElement;

export const ListItemContent: TListItemContent = ({
  certificateId,
  icon: Icon,
  fuelType,
  energy,
  generationTimeTitle,
  generationTimeText,
  viewButtonLabel,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('sm'));

  const handleViewNavigate = () => {
    navigate(`/certificate/detail-view/${certificateId}`);
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.infoBlock}>
        <Icon className={classes.icon} />
        <div>
          <div>
            <Typography color="textSecondary">{fuelType}</Typography>
            <Typography gutterBottom={!mobileView}>{energy}</Typography>
          </div>
          <div>
            <Typography color="textSecondary">{generationTimeTitle}</Typography>
            <Typography>{generationTimeText}</Typography>
          </div>
        </div>
      </div>
      <Button
        onClick={handleViewNavigate}
        className={classes.button}
        variant="outlined"
        color="primary"
      >
        {viewButtonLabel}
      </Button>
    </div>
  );
};
