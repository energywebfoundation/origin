import {
  OrderDTO,
  OrderSide,
  OrderStatus,
} from '@energyweb/exchange-irec-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';
import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { getMainFuelType } from '../utils';

export const useOrderDetailsLogic = (
  order: OrderDTO,
  allFuelTypes: CodeNameDTO[],
  allDevices: ComposedPublicDevice[]
) => {
  if (!order) return { modalFields: {}, fieldLabels: {} };

  const fuelTypes = order.product?.deviceType?.map((type) => {
    const fuelType = type.split(';')[0];
    const { mainType } = getMainFuelType(fuelType, allFuelTypes);
    return mainType;
  });
  const deviceName =
    order.side === OrderSide.Ask
      ? allDevices.find(
          (device) =>
            device.externalRegistryId === (order as any).asset.deviceId
        )?.name
      : '';

  const startVol = parseInt(EnergyFormatter.format(order.startVolume));
  const currentVol = parseInt(EnergyFormatter.format(order.currentVolume));
  const percentageFilled = (currentVol * 100) / startVol;
  const filled =
    order.status === OrderStatus.PartiallyFilled
      ? `${percentageFilled}%`
      : '0%';

  return {
    validFrom: formatDate(order.validFrom, true),
    orderId: order.id,
    price: (order.price / 100).toFixed(2),
    volume: EnergyFormatter.format(order.currentVolume, true),
    deviceName,
    generationFrom: order.product?.generationFrom
      ? formatDate(order.product?.generationFrom)
      : '',
    generationTo: order.product?.generationTo
      ? formatDate(order.product?.generationTo)
      : '',
    fuelType: fuelTypes?.join(', ') || 'Any',
    gridOperator: order.product?.gridOperator?.join(', ') || 'Any',
    region: order.product?.location?.join(', ') || 'Any',
    filled,
  };
};
