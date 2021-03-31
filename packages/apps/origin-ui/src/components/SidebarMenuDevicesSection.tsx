import { OriginFeature } from '@energyweb/utils-general';
import { NavLink } from 'react-router-dom';
import { SidebarSubMenu } from './SidebarSubMenu';
import React, { memo, ReactElement } from 'react';
import { useDeviceMenu } from '@energyweb/origin-ui-core';
import { useDeviceMenu as useIRecDeviceMenu } from '@energyweb/origin-ui-irec-core';
import { useTranslation } from 'react-i18next';

interface IProps {
    enabledFeatures: OriginFeature[];
    devicesPath: string;
    isOpen: boolean;
}

export const SidebarMenuDevicesSection = memo(
    ({ isOpen, enabledFeatures, devicesPath }: IProps): ReactElement => {
        const { t } = useTranslation();
        const irecDeviceMenuList = useIRecDeviceMenu();
        const deviceMenuList = useDeviceMenu();
        return (
            enabledFeatures.includes(OriginFeature.Devices) && (
                <>
                    <li className="mainMenu">
                        <NavLink to={devicesPath}>{t('header.devices')}</NavLink>
                    </li>
                    <SidebarSubMenu
                        enabledFeatures={enabledFeatures}
                        rootLink={devicesPath}
                        menuList={
                            !enabledFeatures.includes(OriginFeature.IRecUIApp)
                                ? deviceMenuList
                                : irecDeviceMenuList
                        }
                        open={isOpen}
                    />
                </>
            )
        );
    }
);

SidebarMenuDevicesSection.displayName = 'SidebarMenuDevicesSection';
