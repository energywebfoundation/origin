import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { supplyStatusOptions, SupplyStatus } from './supplyStatusOptions';
import { TUseUpdateSupplyFormLogic } from './types';

export const UpdateSupplyFormLogic: TUseUpdateSupplyFormLogic = (
  handleClose,
  deviceWithSupply
) => {
  const { t } = useTranslation();

  const initialFormData = {
    fuelType: deviceWithSupply?.fuelType,
    facilityName: deviceWithSupply?.facilityName,
    price: deviceWithSupply?.price,
    status: deviceWithSupply?.active
      ? SupplyStatus.Active
      : SupplyStatus.Paused,
  };

  return {
    formTitle: t('exchange.supply.modals.updateSupply.title'),
    formTitleVariant: 'h5',
    initialValues: initialFormData,
    fields: [
      {
        name: 'fuelType',
        label: t('exchange.supply.fuelType'),
        textFieldProps: {
          disabled: true,
        },
      },
      {
        name: 'facilityName',
        label: t('exchange.supply.facilityName'),
        textFieldProps: {
          disabled: true,
        },
      },
      {
        name: 'price',
        label: t('exchange.supply.price'),
        textFieldProps: {
          type: 'number',
        },
      },
      {
        name: 'status',
        label: t('exchange.supply.status'),
        select: true,
        options: supplyStatusOptions,
      },
    ],
    inputsVariant: 'filled',
    secondaryButtons: [
      {
        variant: 'outlined',
        style: { marginRight: 20 },
        label: t('exchange.supply.cancel'),
        onClick: handleClose,
      },
    ],
    buttonText: t('exchange.supply.update'),
    validationSchema: yup.object({
      fuelType: yup.string().label(t('exchange.supply.fuelType')),
      facilityName: yup.string().label(t('exchange.supply.facilityName')),
      price: yup.number().positive().min(1).label(t('exchange.supply.price')),
      status: yup.string().label(t('exchange.supply.status')),
    }),
  };
};
