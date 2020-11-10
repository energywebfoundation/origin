import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { TableCell, Button, InputAdornment, Grid } from '@material-ui/core';
import { IDevice } from '@energyweb/origin-backend-core';
import {
    getOffChainDataSource,
    getEnvironment,
    formatDate,
    moment,
    useTranslation,
    useValidation,
    EnergyFormatter,
    getUserOffchain
} from '@energyweb/origin-ui-core';
import { getExchangeClient } from '../../features/general';
import { IAsset, IOrderBookOrderDTO, calculateTotalPrice } from '../../utils/exchange';
import { FormInput } from '../Form';
import { Orders, IOrdersProps } from './Orders';

interface IAsksProps {
    buyDirect: (orderId: string, volume: string, price: number) => void;
    energyUnit: string;

    displayAssetDetails?: boolean;
}

type Props = IAsksProps & IOrdersProps;

export function Asks(props: Props) {
    const { buyDirect, displayAssetDetails, energyUnit, currency } = props;

    const exchangeClient = useSelector(getExchangeClient);
    const offChainDataSource = useSelector(getOffChainDataSource);
    const environment = useSelector(getEnvironment);
    const user = useSelector(getUserOffchain);
    const { t } = useTranslation();
    const { Yup } = useValidation();

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

        const newAsset = await exchangeClient.getAssetById(selectedOrder.assetId);
        const newDevice = await offChainDataSource.deviceClient.getByExternalId({
            id: newAsset.deviceId,
            type: environment.ISSUER_ID
        });

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
        energy: '1'
    };

    return (
        <Orders
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
                              <TableCell colSpan={2}>
                                  {t('device.properties.facilityName')}: {device?.facilityName}
                                  <br />
                                  <br />
                                  {t('device.properties.constructed')}:{' '}
                                  {device?.operationalSince &&
                                      moment.unix(device.operationalSince).year()}
                                  <br />
                                  <br />
                                  {t('device.properties.deviceType')}:{' '}
                                  {device?.deviceType?.split(';').join(' - ')}
                                  <br />
                                  <br />
                                  {t('exchange.properties.generationFrom')}:{' '}
                                  {formatDate(asset.generationFrom, false, device.timezone)} <br />
                                  {t('exchange.properties.generationTo')}:{' '}
                                  {formatDate(asset.generationTo, false, device.timezone)}
                                  {selectedOrder?.userId !== user?.id?.toString() && (
                                      <Formik
                                          initialValues={initialFormValues}
                                          validationSchema={VALIDATION_SCHEMA}
                                          validateOnMount={false}
                                          onSubmit={null}
                                      >
                                          {(formikProps) => {
                                              const { isValid, values } = formikProps;

                                              return (
                                                  <Form translate="no">
                                                      <Grid
                                                          container
                                                          spacing={0}
                                                          direction="row"
                                                          alignItems="center"
                                                          justify="center"
                                                      >
                                                          {buyDirectExpanded && (
                                                              <Grid item xs={9}>
                                                                  <FormInput
                                                                      label={t(
                                                                          'exchange.properties.energy'
                                                                      )}
                                                                      property="energy"
                                                                      className="mt-3"
                                                                      required
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
                                                                      } else {
                                                                          setBuyDirectExpanded(
                                                                              true
                                                                          );
                                                                      }
                                                                  }}
                                                                  disabled={!isValid}
                                                                  style={{
                                                                      height: '72px',
                                                                      lineHeight: '72px'
                                                                  }}
                                                              >
                                                                  {t('exchange.actions.buy')}
                                                              </Button>
                                                          </Grid>
                                                      </Grid>
                                                      {buyDirectExpanded && isValid && (
                                                          <>
                                                              {t('exchange.feedback.total')}:{' '}
                                                              {calculateTotalPrice(
                                                                  (
                                                                      selectedOrder.price / 100
                                                                  ).toString(),
                                                                  values.energy
                                                              )}
                                                              {currency}
                                                          </>
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
}
