import {
  Bundle,
  BundlePublicDTO,
} from '@energyweb/exchange-react-query-client';
import { BundleSplit } from '@energyweb/origin-ui-exchange-data';
import {
  getEnergyTypeImage,
  getMainFuelType,
} from '@energyweb/origin-ui-exchange-logic';
import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { Box, Button, IconButton, Typography } from '@material-ui/core';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import React, { FC } from 'react';
import { useStyles } from './SplitContent.styles';
import { useSplitContentsEffects } from './SplitContents.effects';

interface SplitContentsProps {
  splits: BundleSplit[];
  bundle: Bundle | BundlePublicDTO;
  isOwner: boolean;
}

export const SplitContents: FC<SplitContentsProps> = ({
  splits,
  bundle,
  isOwner,
}) => {
  const {
    paginatedData,
    isFirstPage,
    isLastPage,
    handlePreviousPage,
    handleNextPage,
    allDevices,
    allFuelTypes,
    selectedVolume,
    handleSelect,
    buyHandler,
  } = useSplitContentsEffects(splits);
  const classes = useStyles();

  return (
    <Box display="flex" width="100%">
      <Box ml={1} display="flex" alignItems="center">
        <IconButton disabled={isFirstPage} onClick={handlePreviousPage}>
          <ArrowBackIos />
        </IconButton>
      </Box>
      <Box display="flex" justifyContent="space-between">
        {paginatedData.map((split: BundleSplit) => {
          const thisSplitSelected =
            split.volume.toNumber() === selectedVolume.toNumber();

          const totalVolumeText = 'Total volume';
          const totalVolume = PowerFormatter.format(
            split.volume.toNumber(),
            true
          );
          const totalPriceText = 'Total price';
          const totalPrice =
            '$ ' +
            (
              parseInt(PowerFormatter.format(split.volume.toNumber())) *
              (Number(bundle.price) / 100)
            ).toFixed(2);

          return (
            <Box
              onClick={() => handleSelect(split.volume)}
              className={classes.split}
              p={1}
              margin="0px 5px"
              key={split.volume.toString()}
            >
              <Typography color="textSecondary" align="center">
                {totalVolumeText}
              </Typography>
              <Typography align="center">{totalVolume}</Typography>

              {split.items.map((item) => {
                const deviceId = bundle.items.find(
                  (bundleItem) => bundleItem.id === item.id
                )?.asset.deviceId;
                const device = allDevices.find(
                  (d) => d.externalRegistryId === deviceId
                );
                const { mainType } = getMainFuelType(
                  device.fuelType,
                  allFuelTypes
                );

                const Icon = getEnergyTypeImage(
                  mainType as EnergyTypeEnum,
                  thisSplitSelected
                );
                const formattedVolume = PowerFormatter.format(
                  item.volume.toNumber(),
                  true
                );
                return (
                  <Box
                    textAlign="center"
                    my={4}
                    key={item.id + item.volume.toString()}
                  >
                    <Icon style={{ width: 30 }} />
                    <Typography>{formattedVolume}</Typography>
                  </Box>
                );
              })}

              <Typography color="textSecondary" align="center">
                {totalPriceText}
              </Typography>
              <Typography align="center" gutterBottom>
                {totalPrice}
              </Typography>
              {thisSplitSelected && !isOwner && (
                <Box textAlign="center">
                  <Button
                    variant="contained"
                    onClick={() => buyHandler(bundle.id)}
                  >
                    Buy
                  </Button>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      <Box display="flex" alignItems="center">
        <IconButton disabled={isLastPage} onClick={handleNextPage}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
};
