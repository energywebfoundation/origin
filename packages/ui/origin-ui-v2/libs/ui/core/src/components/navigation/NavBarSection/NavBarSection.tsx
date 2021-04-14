import React, { FC, memo } from 'react';
import { Theme } from '@material-ui/core/styles';
import { NavSectionTitle } from '../NavSectionTitle';
import { NavSubMenu } from '../NavSubMenu';
import styled from '@emotion/styled';
import { LightenColor } from '@energyweb/origin-ui-theme';

export type TMenuSection = NavBarSectionProps;

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
}

const Wrapper = styled.div`
  border-top: 1px solid
    ${(props) => {
      const mode = (props.theme as Theme).palette?.mode;
      const themeBgColor = (props.theme as Theme).palette?.background.paper;
      return LightenColor(themeBgColor, 5, mode);
    }};
`;

export const NavBarSection: FC<NavBarSectionProps> = memo(
  ({ sectionTitle, show, rootUrl, isOpen, menuList }) => {
    return (
      <Wrapper>
        {show && (
          <>
            <NavSectionTitle url={rootUrl} title={sectionTitle} />
            <NavSubMenu rootUrl={rootUrl} open={isOpen} menuList={menuList} />
          </>
        )}
      </Wrapper>
    );
  }
);