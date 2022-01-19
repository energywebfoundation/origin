import React, { FC } from 'react';
import { NavSectionTitle } from '../NavSectionTitle';
import { NavSubMenu } from '../NavSubMenu';
import { useStyles } from './NavBarSection.styles';

export type TMenuSection = Omit<NavBarSectionProps, 'titleClickHandler'>;

export type TModuleMenuItem = {
  url: string;
  label: string;
  show: boolean;
  dataCy?: string;
};

export interface NavBarSectionProps {
  sectionTitle: string;
  show: boolean;
  rootUrl: string;
  isOpen: boolean;
  menuList: TModuleMenuItem[];
  closeMobileNav?: () => void;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
  dataCy?: string;
}

export const NavBarSection: FC<NavBarSectionProps> = ({
  sectionTitle,
  show,
  rootUrl,
  dataCy,
  isOpen,
  menuList,
  closeMobileNav,
  menuButtonClass,
  selectedMenuItemClass,
}) => {
  const classes = useStyles();
  const availableLinks = menuList.filter((item) => item.show);
  const sectionTitleUrl = `${rootUrl}/${availableLinks[0]?.url}`;

  return (
    <div>
      {show ? (
        <div className={classes.wrapper}>
          <NavSectionTitle
            url={sectionTitleUrl}
            title={sectionTitle}
            dataCy={dataCy}
            buttonClass={menuButtonClass}
          />
          <NavSubMenu
            closeMobileNav={closeMobileNav}
            rootUrl={rootUrl}
            open={isOpen}
            menuList={menuList}
            selectedMenuItemClass={selectedMenuItemClass}
            menuButtonClass={menuButtonClass}
          />
        </div>
      ) : null}
    </div>
  );
};
