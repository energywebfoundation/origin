import React from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { Box, Divider, Typography } from '@material-ui/core';
import { formatDate } from '@energyweb/origin-ui-utils';
import { ArrowRightAlt } from '@material-ui/icons';
import { useStyles } from './OrderDetails.styles';
import { useOrderDetailsEffects } from './OrderDetails.effects';

export const OrderDetails = () => {
  const classes = useStyles();
  const { genericModalProps, modalFields, fieldLabels } =
    useOrderDetailsEffects();

  const {
    validFrom,
    orderId,
    volume,
    deviceName,
    generationFrom,
    generationTo,
    fuelType,
    gridOperator,
    region,
    filled,
  } = modalFields;

  const {
    orderIdLabel,
    fuelTypeLabel,
    gridOperatorLabel,
    regionLabel,
    filledLabel,
  } = fieldLabels;

  return (
    <GenericModal
      dialogContentProps={{ className: classes.dialogContent }}
      dialogActionsProps={{ className: classes.lightBlock }}
      {...genericModalProps}
      customContent={
        <Box>
          <Box px={2} py={1}>
            <Typography fontSize={12} color="textSecondary">
              {validFrom}
            </Typography>
          </Box>

          <Box
            mb={1}
            width="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Box px={2}>
              <Typography fontSize={12} color="textSecondary">
                {orderIdLabel}
              </Typography>
              <Typography fontSize={12} color="textSecondary">
                {orderId}
              </Typography>
            </Box>
            <Box px={2}>
              <Typography color="textSecondary" fontSize={20}>
                {`$ ${(2200 / 100).toFixed(2)}`}
              </Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            className={classes.lightBlock}
          >
            <Box px={2} py={1}>
              <Box>
                <Typography color="textSecondary" fontSize={20}>
                  {volume}
                </Typography>
              </Box>
              <Box>
                <Typography fontSize={12} color="textSecondary">
                  {deviceName}
                </Typography>
              </Box>
            </Box>
            {generationFrom && generationTo && (
              <Box display="flex" alignItems="center" p={2}>
                <Typography fontSize={12} color="textSecondary">
                  {generationFrom}
                </Typography>
                <ArrowRightAlt />
                <Typography fontSize={12} color="textSecondary">
                  {generationTo}
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            m={1}
            display="flex"
            justifyContent="space-between"
            className={classes.darkBlock}
          >
            <Box p={1}>
              <Typography fontSize={12} color="textSecondary">
                {fuelTypeLabel}
              </Typography>
              <Typography fontSize={12} color="textSecondary">
                {fuelType}
              </Typography>
            </Box>
            <Box p={1}>
              <Typography fontSize={12} color="textSecondary">
                {gridOperatorLabel}
              </Typography>
              <Typography fontSize={12} color="textSecondary">
                {gridOperator}
              </Typography>
            </Box>
            <Box p={1}>
              <Typography fontSize={12} color="textSecondary">
                {regionLabel}
              </Typography>
              <Typography fontSize={12} color="textSecondary">
                {region}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.lightBlock}>
            <Box px={2} py={1}>
              <Typography fontSize={12} color="textSecondary">
                {filledLabel}
              </Typography>
              <Typography fontSize={12} color="textSecondary">
                {filled}
              </Typography>
            </Box>
          </Box>

          <Divider classes={{ root: classes.divider }} />
        </Box>
      }
    />
  );
};
