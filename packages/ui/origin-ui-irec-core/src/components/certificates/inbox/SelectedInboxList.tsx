import React from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { makeStyles } from '@material-ui/core';
import { useOriginConfiguration } from '../../../utils/configuration';
import { InboxSelectedItem } from './InboxSelectedItem';
import { IInboxCertificateData, IInboxItemData } from './InboxItem';

export function SelectedInboxList(prop: {
    pairs: [IInboxItemData, IInboxCertificateData][];
    setEnergy: (device: IInboxItemData, cert: IInboxCertificateData, value: BigNumber) => void;
}) {
    const configuration = useOriginConfiguration();
    const { pairs, setEnergy } = prop;
    const { t } = useTranslation();

    const defaultTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;

    const useStyles = makeStyles({
        selectedItemsEmpty: {
            padding: '64px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: defaultTextColor
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
