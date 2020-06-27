import React from 'react';
import { FormControlLabel, Checkbox, Box, useTheme } from '@material-ui/core';
import { ICertificateViewItem } from '../../features/certificates';
import { CertificateGroup } from './CertificateGroup';

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
    const {
        typography: { fontSizeMd }
    } = useTheme();

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
                control={<Checkbox checked={isAllSelected()} onClick={toggleSelectAll} />}
                label={
                    <Box fontSize={fontSizeMd} color="text.secondary">
                        Select All
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
