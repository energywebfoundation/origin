import React, { FC } from 'react';
import { NavSectionTitle } from '../NavSectionTitle';
import { NavSubMenu } from '../NavSubMenu';
import { useStyles } from './NavBarSection.styles';

export type TMenuSection = Omit<NavBarSectionProps, 'titleClickHandler'>;

export type TModuleMenuItem = {
  url: string;
  label: string;
  show: boolean;
};

export interface NavBarSectionProps {
  sectionTitle: string;
  show: boolean;
  rootUrl: string;
  isOpen: boolean;
  menuList: TModuleMenuItem[];
  closeMobileNav?: () => void;
}

export const NavBarSection: FC<NavBarSectionProps> = ({
  sectionTitle,
  show,
  rootUrl,
  isOpen,
  menuList,
  closeMobileNav,
}) => {
  const classes = useStyles();
  const availableLinks = menuList.filter((item) => item.show);
  const sectionTitleUrl = `${rootUrl}/${availableLinks[0].url}`;

  return (
    <div className={classes.wrapper}>
      {show && (
        <>
          <NavSectionTitle url={sectionTitleUrl} title={sectionTitle} />
          <NavSubMenu
            closeMobileNav={closeMobileNav}
            rootUrl={rootUrl}
            open={isOpen}
            menuList={menuList}
          />
        </>
      )}
    </div>
  );
};
