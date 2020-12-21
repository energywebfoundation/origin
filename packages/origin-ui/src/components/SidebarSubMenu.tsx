import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Collapse } from '@material-ui/core';
import { OriginFeature } from '@energyweb/utils-general';
import { useTranslation } from '@energyweb/origin-ui-core';
import { OriginConfigurationContext } from './OriginConfigurationContext';

interface IModuleMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    features?: OriginFeature[];
    props?: any;
}

interface IProps {
    menuList: IModuleMenuItem[];
    rootLink: string;
    open: boolean;
}

export function SidebarSubMenu(props: IProps) {
    const { menuList, rootLink, open } = props;

    const originConfiguration = useContext(OriginConfigurationContext);
    const enabledFeatures = originConfiguration?.enabledFeatures;
    const { t } = useTranslation();

    return (
        <Collapse in={open} timeout="auto">
            <ul className="subMenu">
                {menuList.map((menu) => {
                    if (
                        menu.show &&
                        (menu.features
                            ? menu.features.every((flag) => enabledFeatures?.includes(flag))
                            : true)
                    ) {
                        const link = `${rootLink}/${menu.key}`;

                        return (
                            <li key={menu.key}>
                                <NavLink to={link}>{t(menu.label)}</NavLink>
                            </li>
                        );
                    }
                })}
            </ul>
        </Collapse>
    );
}
