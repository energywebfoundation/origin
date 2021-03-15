import { InboxPanel } from './InboxPanel';
import {
    CertificateSource,
    requestPublishForSale,
    requestWithdrawCertificate,
    getUserOffchain
} from '../../features';
import React, { useState } from 'react';
import { TabContent } from './Inbox/InboxTabContent';
import { SelectedInboxList, IInboxCertificateData } from './Inbox';
import { EnergyFormatter } from '../../utils';
import TextField from '@material-ui/core/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { useOriginConfiguration } from '../../utils/configuration';

export function ExchangeInboxPage(): JSX.Element {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const user = useSelector(getUserOffchain);
    const [price, setPrice] = useState(0);

    const hasBlockchainAccount = Boolean(user.blockchainAccountAddress);

    async function publishForSale(certs: IInboxCertificateData[], callback: () => void) {
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
                    assetId: certificate.assetId
                })
            );
        });
    }

    async function withdraw(certs: IInboxCertificateData[], callback: () => void) {
        const address = user.blockchainAccountAddress;

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
                    }
                })
            );
        });
    }

    const configuration = useOriginConfiguration();
    const simpleTextColor = configuration?.styleConfig?.SIMPLE_TEXT_COLOR;

    const useStyles = makeStyles({
        text_1: {
            fontSize: '16px',
            color: simpleTextColor
        },

        text_2: {
            fontSize: '14px',
            color: simpleTextColor,
            opacity: '.5'
        }
    });

    const classes = useStyles();

    return (
        <InboxPanel
            mode={CertificateSource.Exchange}
            title={'certificate.info.exchangeInbox'}
            tabs={hasBlockchainAccount ? ['Sell', 'Withdraw'] : ['Sell']}
        >
            {({
                tabIndex,
                selectedCerts,
                getSelectedItems,
                setEnergy,
                getSelectedCertificates,
                updateView,
                totalVolume
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
                                disableButton={price <= 0}
                            >
                                <SelectedInboxList
                                    pairs={getSelectedItems()}
                                    setEnergy={setEnergy}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className={classes.text_2}>
                                        {t('certificate.info.totalPrice')}:{' '}
                                    </div>
                                    <div className={classes.text_1} style={{ fontSize: 16 }}>
                                        ${EnergyFormatter.format(totalVolume.mul(price))}
                                    </div>
                                </div>
                            </TabContent>
                        )}
                        {hasBlockchainAccount && tabIndex === 1 && (
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
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
