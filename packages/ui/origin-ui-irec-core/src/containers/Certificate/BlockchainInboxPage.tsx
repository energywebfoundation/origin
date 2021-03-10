import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
    getUserOffchain,
    CertificateSource,
    requestClaimCertificate,
    requestDepositCertificate,
    EnergyFormatter,
    getCountryCodeFromId
} from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';
import {
    InboxPanel,
    TabContent,
    SelectedInboxList,
    BeneficiaryForm,
    IInboxCertificateData
} from '../../components/certificates/inbox';
import { IClaimData } from '@energyweb/issuer';

export function BlockchainInboxPage(): JSX.Element {
    const [retireForBeneficiary, setRetireForBeneficiary] = useState<boolean>(false);
    const [beneficiaryFormData, setBeneficiaryFormData] = useState<IClaimData>();
    const [disableButton, setDisableButton] = useState<boolean>(false);

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const user = useSelector(getUserOffchain);

    useEffect(() => {
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

    async function claim(cert: IInboxCertificateData, callback: () => void) {
        dispatch(
            requestClaimCertificate({
                certificateId: cert.id,
                claimData: beneficiaryFormData,
                amount: cert.energy,
                callback
            })
        );
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
                                onSubmit={() => claim(getSelectedCertificates()[0], updateView)}
                                selectedCerts={selectedCerts}
                                disableButton={disableButton}
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
                                        disabled={disableButton}
                                        setDisabled={setDisableButton}
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
