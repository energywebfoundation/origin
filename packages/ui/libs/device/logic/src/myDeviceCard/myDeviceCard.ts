import {
  CodeNameDTO,
  DeviceState,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ThailandFlag } from '@energyweb/origin-ui-assets';
import {
  IconHoverTextProps,
  IconTextProps,
  SpecFieldProps,
} from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';
import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getMainFuelType, getEnergyTypeImage } from '../utils';

type TUseSpecsForMyDeviceCardArgs = {
  device: ComposedDevice;
  allTypes: CodeNameDTO[];
  imageUrl: string;
};

export type TUseSpecsForMyDeviceCardReturnType = {
  imageUrl: string;
  fallbackIcon: IconHoverTextProps['icon'];
  cardHeaderProps: {
    deviceName: string;
    deviceState: DeviceState;
    viewButtonText: string;
    viewButtonLink: string;
    editButtonText: string;
    editButtonLink: string;
    specFieldProps: SpecFieldProps;
  };
  cardContentProps: {
    iconsProps: IconTextProps[];
  };
};

export type TUseSpecsForMyDeviceCard = (
  args: TUseSpecsForMyDeviceCardArgs
) => TUseSpecsForMyDeviceCardReturnType;

export const useSpecsForMyDeviceCard: TUseSpecsForMyDeviceCard = ({
  device,
  allTypes,
  imageUrl,
}) => {
  const { t } = useTranslation();

  const { mainType, restType } = getMainFuelType(device.fuelType, allTypes);
  const deviceIconRegular = getEnergyTypeImage(
    mainType.toLowerCase() as EnergyTypeEnum
  );

  const cardHeaderProps: TUseSpecsForMyDeviceCardReturnType['cardHeaderProps'] =
    {
      deviceName: device.name,
      deviceState: device.status,
      viewButtonText: t('device.card.viewDetailsButton'),
      viewButtonLink: `/device/detail-view/${device.id}`,
      editButtonText: t('device.card.editButton'),
      editButtonLink: `/device/edit/${device.id}`,
      specFieldProps: {
        label: t('device.card.capacity'),
        value: PowerFormatter.format(device.capacity),
      },
    };

  const cardContentProps: TUseSpecsForMyDeviceCardReturnType['cardContentProps'] =
    {
      iconsProps: [
        {
          icon: deviceIconRegular,
          title: mainType,
          subtitle: restType,
        },
        {
          icon: ThailandFlag,
          title: `${device.region}, ${device.subregion}`,
        },
      ],
    };

  return {
    imageUrl,
    fallbackIcon: deviceIconRegular,
    cardHeaderProps,
    cardContentProps,
  };
};
