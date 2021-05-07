import { IconText, SpecField } from '@energyweb/origin-ui-core';
import { Box, Card, CardContent } from '@material-ui/core';
import React, { FC } from 'react';
import { useDetailViewCardEffects } from './DetailViewCard.effects';
import { useStyles } from './DetailViewCard.styles';

export interface DetailViewCardProps {
  device: any;
}

export const DetailViewCard: FC<DetailViewCardProps> = ({ device }) => {
  const classes = useStyles();
  const { headingIcon, specsData } = useDetailViewCardEffects({ device });
  return (
    <Card className={classes.card}>
      <Box py={1} px={2} className={classes.heading}>
        <IconText
          gridContainerProps={{
            direction: 'row-reverse',
            justifyContent: 'space-between',
          }}
          iconProps={{ className: classes.icon }}
          {...headingIcon}
        />
      </Box>
      <CardContent>
        {specsData.map((spec) => (
          <SpecField
            key={spec.label}
            wrapperProps={{ className: classes.specWrapper }}
            valueProps={{ className: classes.specValue }}
            {...spec}
          />
        ))}
      </CardContent>
    </Card>
  );
};
