import React, { memo, ReactElement, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@material-ui/core';
import { OriginFeature } from '@energyweb/utils-general';

interface IModuleMenuItem {
    key: string;
    label: string;
    component?: ReactNode;
    render?: () => any;
    show: boolean;
    features?: OriginFeature[];
    props?: any;
}

interface IProps {
    menuList: IModuleMenuItem[];
    rootLink: string;
    open: boolean;
    enabledFeatures: OriginFeature[];
}

export const SidebarSubMenu = memo(
    (props: IProps): ReactElement => {
        const { menuList, rootLink, open, enabledFeatures = [] } = props;
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
                                <li key={menu.key} data-cy={menu.key}>
                                    <NavLink to={link}>{t(menu.label)}</NavLink>
                                </li>
                            );
                        }
                    })}
                </ul>
            </Collapse>
        );
    }
);

SidebarSubMenu.displayName = 'SidebarSubMenu';
