import React, { memo, ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { usePermissions, Requirements, TableFallback } from '@energyweb/origin-ui-core';
import { Certificates, SelectedForSale } from '../../components';
import { useCreateBundlePageEffects } from './hooks/useCreateBundlePageEffects';

export const CreateBundlePage = memo(
    (): ReactElement => {
        const { canAccessPage } = usePermissions();

        if (!canAccessPage?.value) {
            return <Requirements />;
        }

        const {
            myDevices,
            bgColorDarker,
            setSelectedCertificateViewItem,
            selectedCertificateViewItem,
            exchangePageUrl,
            history
        } = useCreateBundlePageEffects();

        if (!myDevices) {
            return <TableFallback />;
        }

        return (
            <Box
                className="CreateBundleForm"
                display="grid"
                style={{ gridTemplateColumns: '60% 40%' }}
            >
                <Box className="Certificates" mr={2} style={{ backgroundColor: bgColorDarker }}>
                    <Certificates
                        devices={myDevices}
                        selected={selectedCertificateViewItem}
                        setSelected={setSelectedCertificateViewItem}
                    />
                </Box>
                <Box className="Certificates" style={{ backgroundColor: bgColorDarker }}>
                    <SelectedForSale
                        devices={myDevices}
                        certificatesToBundle={selectedCertificateViewItem}
                        callback={() => history.push(`${exchangePageUrl}/bundles`)}
                    />
                </Box>
            </Box>
        );
    }
);

CreateBundlePage.displayName = 'CreateBundlePage';
