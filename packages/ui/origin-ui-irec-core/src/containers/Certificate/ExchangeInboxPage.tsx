import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/styles';
import {
  CertificateSource,
  requestPublishForSale,
  requestWithdrawCertificate,
  EnergyFormatter,
  fromUsersSelectors,
} from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';
import {
  InboxPanel,
  TabContent,
  SelectedInboxList,
  IInboxCertificateData,
} from '../../components/certificates/inbox';

export function ExchangeInboxPage(): JSX.Element {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector(fromUsersSelectors.getUserOffchain);
  const [price, setPrice] = useState(0);

  async function publishForSale(
    certs: IInboxCertificateData[],
    callback: () => void
  ) {
    certs.forEach((certificate) => {
      dispatch(
        requestPublishForSale({
          certificateId: certificate.id,
          amount: certificate.energy,
          price: Math.round((price + Number.EPSILON) * 100),
          callback: () => {
            callback();
          },
          source: certificate.source,
          assetId: certificate.assetId,
        })
      );
    });
  }

  async function withdraw(
    certs: IInboxCertificateData[],
    callback: () => void
  ) {
    const address = user.organization?.blockchainAccountAddress;

    certs.forEach((certificate) => {
      const assetId = certificate.assetId;
      const amount = certificate.energy.toString();
      dispatch(
        requestWithdrawCertificate({
          assetId,
          address,
          amount,
          callback: () => {
            callback();
          },
        })
      );
    });
  }

  const configuration = useOriginConfiguration();
  const simpleTextColor = configuration?.styleConfig?.SIMPLE_TEXT_COLOR;

  const useStyles = makeStyles({
    text_1: {
      fontSize: '16px',
      color: simpleTextColor,
    },

    text_2: {
      fontSize: '14px',
      color: simpleTextColor,
      opacity: '.5',
    },
  });

  const classes = useStyles();

  return (
    <InboxPanel
      mode={CertificateSource.Exchange}
      title={'certificate.info.exchangeInbox'}
      tabs={['Sell', 'Withdraw']}
    >
      {({
        tabIndex,
        selectedCerts,
        getSelectedItems,
        setEnergy,
        getSelectedCertificates,
        updateView,
        totalVolume,
      }) => {
        return (
          <>
            {tabIndex === 0 && (
              <TabContent
                header="certificate.info.selectedForSale"
                buttonLabel="certificate.actions.sellNCertificates"
                onSubmit={() =>
                  publishForSale(getSelectedCertificates(), updateView)
                }
                selectedCerts={selectedCerts}
              >
                <SelectedInboxList
                  pairs={getSelectedItems()}
                  setEnergy={setEnergy}
                />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div className={classes.text_2}>
                    {t('certificate.info.totalVolume')}:{' '}
                  </div>
                  <div className={classes.text_1} style={{ fontSize: 16 }}>
                    {EnergyFormatter.format(totalVolume, true)}
                  </div>
                </div>
                <TextField
                  style={{ margin: '24px 0' }}
                  type="number"
                  value={price}
                  onChange={(ev) => {
                    const newValue = parseFloat(ev.target.value);
                    if (!isNaN(newValue)) setPrice(newValue);
                  }}
                />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div className={classes.text_2}>
                    {t('certificate.info.totalPrice')}:{' '}
                  </div>
                  <div className={classes.text_1} style={{ fontSize: 16 }}>
                    ${EnergyFormatter.format(totalVolume.mul(price))}
                  </div>
                </div>
              </TabContent>
            )}
            {tabIndex === 1 && (
              <TabContent
                header="certificate.info.selectedForWithdraw"
                buttonLabel="certificate.actions.withdrawNCertificates"
                onSubmit={() => withdraw(getSelectedCertificates(), updateView)}
                selectedCerts={selectedCerts}
              >
                <SelectedInboxList
                  pairs={getSelectedItems()}
                  setEnergy={setEnergy}
                />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div className={classes.text_2}>
                    {t('certificate.info.totalVolume')}:{' '}
                  </div>
                  <div className={classes.text_1} style={{ fontSize: 16 }}>
                    {EnergyFormatter.format(totalVolume, true)}
                  </div>
                </div>
              </TabContent>
            )}
          </>
        );
      }}
    </InboxPanel>
  );
}
