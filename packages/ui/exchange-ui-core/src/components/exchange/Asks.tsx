import React, { useState, useEffect, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TableCell, Button, InputAdornment, Grid, Typography } from '@material-ui/core';
import { IDevice, UserStatus } from '@energyweb/origin-backend-core';
import { Formik, Form } from 'formik';
import {
    formatDate,
    useValidation,
    EnergyFormatter,
    LightenColor,
    fromGeneralSelectors,
    fromUsersSelectors
} from '@energyweb/origin-ui-core';
import { IAsset, IOrderBookOrderDTO, calculateTotalPrice } from '../../utils/exchange';
import { useOriginConfiguration } from '../../utils/configuration';
import { FormInput } from '../Form';
import { Orders, IOrdersProps } from './Orders';
import moment from 'moment';

interface IAsksProps {
    buyDirect: (orderId: string, volume: string, price: number) => void;
    energyUnit: string;
    displayAssetDetails?: boolean;
    directBuydisabled?: boolean;
}

type Props = IAsksProps & IOrdersProps;

export const Asks = (props: Props): ReactElement => {
    const {
        buyDirect,
        displayAssetDetails,
        energyUnit,
        currency,
        ordersTotalVolume,
        directBuydisabled = false
    } = props;

    const exchangeClient = useSelector(fromGeneralSelectors.getExchangeClient);
    const backendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const environment = useSelector(fromGeneralSelectors.getEnvironment);
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const { t } = useTranslation();
    const { Yup } = useValidation();

    const popoverText = [
        t('exchange.popover.asksDescription'),
        t('exchange.popover.asksFurtherInstructions')
    ];

    const [selectedOrder, setSelectedOrder] = useState<IOrderBookOrderDTO>(null);
    const [asset, setAsset] = useState<IAsset>();
    const [device, setDevice] = useState<IDevice>();
    const [buyDirectExpanded, setBuyDirectExpanded] = useState(false);

    async function fetchDetails(assetId: string) {
        if (!assetId) {
            setAsset(null);
            setDevice(null);
            return;
        }

        const { data: newAsset } = await exchangeClient.assetClient.get(selectedOrder.assetId);
        const { data: newDevice } = await backendClient.deviceClient.getByExternalId(
            environment.ISSUER_ID,
            newAsset.deviceId
        );

        setAsset(newAsset);
        setDevice(newDevice);
    }

    useEffect(() => {
        fetchDetails(selectedOrder?.assetId);

        return () => {
            setAsset(null);
            setDevice(null);
        };
    }, [selectedOrder]);

    const VALIDATION_SCHEMA = Yup.object().shape({
        energy: Yup.number()
            .positive()
            .integer()
            .max(selectedOrder ? EnergyFormatter.getValueInDisplayUnit(selectedOrder.volume) : 0)
            .label(t('exchange.properties.energy'))
    });

    const initialFormValues = {
        energy: ''
    };

    const originBgColor = useOriginConfiguration()?.styleConfig.MAIN_BACKGROUND_COLOR;
    const customRowBgColor = LightenColor(originBgColor, -3);

    return (
        <Orders
            reverseRows={true}
            ordersTotalVolume={ordersTotalVolume}
            popoverText={popoverText}
            handleRowClick={(newOrder) => {
                if (selectedOrder?.id === newOrder?.id) {
                    setSelectedOrder(null);
                } else {
                    setSelectedOrder(newOrder);
                }
            }}
            customRow={
                selectedOrder && displayAssetDetails && device
                    ? {
                          shouldDisplay: (row: { id: string }) => row?.id === selectedOrder?.id,
                          display: (
                              <TableCell colSpan={4} style={{ backgroundColor: customRowBgColor }}>
                                  {t('device.properties.facilityName')}
                                  <Typography paragraph>{device?.facilityName}</Typography>

                                  {t('device.properties.constructed')}
                                  <Typography paragraph>
                                      {device?.operationalSince &&
                                          moment.unix(device.operationalSince).year()}
                                  </Typography>

                                  {t('device.properties.deviceType')}
                                  <Typography paragraph>
                                      {device?.deviceType?.split(';').join(' - ')}
                                  </Typography>

                                  <Grid container>
                                      <Grid item xs={6}>
                                          {t('exchange.properties.generationStart')}
                                          <Typography paragraph>
                                              {formatDate(
                                                  asset.generationFrom,
                                                  false,
                                                  device.timezone
                                              )}
                                          </Typography>
                                      </Grid>

                                      <Grid item xs={6}>
                                          {t('exchange.properties.generationEnd')}
                                          <Typography paragraph>
                                              {formatDate(
                                                  asset.generationTo,
                                                  false,
                                                  device.timezone
                                              )}
                                          </Typography>
                                      </Grid>
                                  </Grid>

                                  {selectedOrder?.userId !== user?.id?.toString() && (
                                      <Formik
                                          initialValues={initialFormValues}
                                          validationSchema={VALIDATION_SCHEMA}
                                          validateOnMount={false}
                                          onSubmit={null}
                                      >
                                          {(formikProps) => {
                                              const {
                                                  isValid,
                                                  values,
                                                  resetForm,
                                                  dirty
                                              } = formikProps;

                                              return (
                                                  <Form translate="no">
                                                      <Grid
                                                          container
                                                          direction="row"
                                                          alignItems="center"
                                                          justify="flex-end"
                                                          spacing={1}
                                                      >
                                                          {buyDirectExpanded && (
                                                              <Grid item xs={9}>
                                                                  <FormInput
                                                                      property="energy"
                                                                      required
                                                                      label={t(
                                                                          'exchange.properties.energy'
                                                                      )}
                                                                      InputProps={{
                                                                          endAdornment: (
                                                                              <InputAdornment position="end">
                                                                                  {energyUnit}
                                                                              </InputAdornment>
                                                                          )
                                                                      }}
                                                                  />
                                                              </Grid>
                                                          )}
                                                          {user?.status === UserStatus.Active && (
                                                              <Grid item xs={3}>
                                                                  <Button
                                                                      onClick={() => {
                                                                          if (buyDirectExpanded) {
                                                                              buyDirect(
                                                                                  selectedOrder.id,
                                                                                  EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                                                                                      parseInt(
                                                                                          values.energy,
                                                                                          10
                                                                                      )
                                                                                  )?.toString(),
                                                                                  selectedOrder.price
                                                                              );
                                                                              resetForm();
                                                                              setBuyDirectExpanded(
                                                                                  false
                                                                              );
                                                                          } else {
                                                                              setBuyDirectExpanded(
                                                                                  true
                                                                              );
                                                                          }
                                                                      }}
                                                                      disabled={
                                                                          directBuydisabled ||
                                                                          !isValid ||
                                                                          (buyDirectExpanded &&
                                                                              !dirty)
                                                                      }
                                                                      variant="outlined"
                                                                      color="primary"
                                                                      style={{
                                                                          fontWeight: 600,
                                                                          outline: 'none'
                                                                      }}
                                                                  >
                                                                      {t('exchange.actions.buy')}
                                                                  </Button>
                                                              </Grid>
                                                          )}
                                                      </Grid>
                                                      {buyDirectExpanded && isValid && (
                                                          <Typography className="mt-2">
                                                              {t('exchange.feedback.total')}:{' '}
                                                              {calculateTotalPrice(
                                                                  (
                                                                      selectedOrder.price / 100
                                                                  ).toString(),
                                                                  values.energy
                                                              )}{' '}
                                                              {currency}
                                                          </Typography>
                                                      )}
                                                  </Form>
                                              );
                                          }}
                                      </Formik>
                                  )}
                              </TableCell>
                          )
                      }
                    : null
            }
            {...props}
        />
    );
};
