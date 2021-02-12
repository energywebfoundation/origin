import { InboxSelectedItem } from './InboxSelectedItem';
import React from 'react';
import { BigNumber } from 'ethers';
import { IInboxCertificateData, IInboxItemData } from './InboxItem';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { useOriginConfiguration } from '../../../utils/configuration';

export function SelectedInboxList(prop: {
    pairs: [IInboxItemData, IInboxCertificateData][];
    setEnergy: (device: IInboxItemData, cert: IInboxCertificateData, value: BigNumber) => void;
}) {
    const configuration = useOriginConfiguration();
    const { pairs, setEnergy } = prop;
    const { t } = useTranslation();

    const { TEXT_COLOR_DEFAULT } = configuration?.styleConfig;

    const useStyles = makeStyles({
        selectedItemsEmpty: {
            padding: '64px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: TEXT_COLOR_DEFAULT
        }
    });

    const classes = useStyles();

    return (
        <>
            {pairs.map(([d, c]) => {
                return (
                    <InboxSelectedItem
                        key={c.id}
                        cert={c}
                        device={d}
                        setEnergy={(v) => setEnergy(d, c, v)}
                    />
                );
            })}

            {pairs.length === 0 && (
                <div className={classes.selectedItemsEmpty}>
                    {t('certificate.info.selectCertificate')}
                </div>
            )}
        </>
    );
}
