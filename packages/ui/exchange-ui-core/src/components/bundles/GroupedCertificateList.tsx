import React from 'react';
import { FormControlLabel, Checkbox, Box, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ICertificateViewItem } from '@energyweb/origin-ui-core';
import { CertificateGroup } from './CertificateGroup';
import { IOriginTypography } from '../../types/typography';

interface IOwnProps {
    groups: { [key: string]: ICertificateViewItem[] };
    selected: ICertificateViewItem[];
    setSelected: (certs: ICertificateViewItem[]) => void;
}

export const GroupedCertificateList = (props: IOwnProps) => {
    const { groups, selected, setSelected } = props;
    const certificates = Array.from(
        Object.values(groups).reduce((total, certs) => total.concat(certs), [])
    );

    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;

    const { t } = useTranslation();

    const isAllSelected = (): boolean => {
        if (certificates.length === 0) {
            return false;
        }
        for (const cert of certificates) {
            if (!selected.find((s) => s.id === cert.id)) {
                return false;
            }
        }
        return true;
    };

    const toggleSelectAll = () => {
        if (isAllSelected()) {
            return setSelected([]);
        }
        return setSelected([...certificates]);
    };

    return (
        <Box>
            <FormControlLabel
                style={{ marginLeft: 0 }}
                control={
                    <Checkbox color="primary" checked={isAllSelected()} onClick={toggleSelectAll} />
                }
                label={
                    <Box fontSize={fontSizeMd} color="text.secondary">
                        {t('certificate.actions.selectAll')}
                    </Box>
                }
            />
            {Object.keys(groups).map((facility, index, arr) => (
                <Box mb={index === arr.length - 1 ? 0 : 0.5} key={facility}>
                    <CertificateGroup
                        certificates={groups[facility]}
                        selected={selected}
                        setSelected={setSelected}
                    />
                </Box>
            ))}
        </Box>
    );
};
