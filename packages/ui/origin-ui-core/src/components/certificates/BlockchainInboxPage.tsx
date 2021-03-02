import { InboxPanel } from './InboxPanel';
import {
    CertificateSource,
    requestClaimCertificateBulk,
    requestDepositCertificate
} from '../../features/certificates';
import React, { useEffect, useState } from 'react';
import { TabContent } from './Inbox/InboxTabContent';
import { SelectedInboxList } from './Inbox/SelectedInboxList';
import { Checkbox } from '@material-ui/core';
import { BeneficiaryForm, IBeneficiaryFormData } from './Inbox/BeneficiaryForm';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IInboxCertificateData } from './Inbox/InboxItem';
import { getUserOffchain } from '../../features/users';
import { Countries } from '@energyweb/utils-general';
import { EnergyFormatter } from '../../utils';
import { useOriginConfiguration } from '../../utils/configuration';
import { makeStyles } from '@material-ui/styles';

export function BlockchainInboxPage(): JSX.Element {
    const [retireForBeneficiary, setRetireForBeneficiary] = useState<boolean>(false);
    const [beneficiaryFormData, setBeneficiaryFormData] = useState<IBeneficiaryFormData>();

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const user = useSelector(getUserOffchain);

    useEffect(() => {
        const getCountryCodeFromId = (code: string) =>
            Countries.find((country) => country.code === code)?.code;

        setRetireForBeneficiary(false);
        setBeneficiaryFormData({
            beneficiary: user?.organization?.name,
            address: user?.organization?.address,
            zipCode: user?.organization?.zipCode,
            region: null,
            countryCode: getCountryCodeFromId(user?.organization?.country)
        });
    }, [user]);

    async function deposit(certs: IInboxCertificateData[], callback: () => void) {
        certs.forEach((cert) => {
            dispatch(
                requestDepositCertificate({
                    certificateId: cert.id,
                    amount: cert.energy,
                    callback: () => {
                        callback();
                    }
                })
            );
        });
    }

    async function claim(certs: IInboxCertificateData[], callback: () => void) {
        dispatch(
            requestClaimCertificateBulk({
                certificateIds: certs.map((c) => c.id),
                claimData: beneficiaryFormData
            })
        );

        callback();
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
            mode={CertificateSource.Blockchain}
            title={'certificate.info.blockchainInbox'}
            tabs={['Deposit', 'Retire']}
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
                                header="certificate.info.selectedForDeposit"
                                buttonLabel="certificate.actions.depositNCertificates"
                                onSubmit={() => deposit(getSelectedCertificates(), updateView)}
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
                        {tabIndex === 1 && (
                            <TabContent
                                header="certificate.info.selectedForRetirement"
                                buttonLabel="certificate.actions.retireNCertificates"
                                onSubmit={() => claim(getSelectedCertificates(), updateView)}
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
                                <div>
                                    <Checkbox
                                        color={'primary'}
                                        checked={retireForBeneficiary}
                                        onChange={() =>
                                            setRetireForBeneficiary(!retireForBeneficiary)
                                        }
                                    />
                                    <span>{t('certificate.info.retireForBeneficiary')}</span>
                                </div>
                                {retireForBeneficiary && (
                                    <BeneficiaryForm
                                        data={beneficiaryFormData}
                                        setData={setBeneficiaryFormData}
                                    />
                                )}
                            </TabContent>
                        )}
                    </>
                );
            }}
        </InboxPanel>
    );
}
