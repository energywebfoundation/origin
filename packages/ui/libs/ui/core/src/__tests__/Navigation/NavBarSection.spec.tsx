import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/navigation/NavBarSection/NavBarSection.stories';
import { NavBarSectionProps } from '../../components/navigation/NavBarSection/NavBarSection';

const { Open, Closed } = composeStories(stories);

describe('NavBarSection', () => {
  it('should render Open', () => {
    const { baseElement, getByText } = render(
      <Open {...(Open.args as NavBarSectionProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Open.args.sectionTitle)).toBeInTheDocument();
    expect(getByText(Open.args.menuList[0].label)).toBeVisible();
    expect(getByText(Open.args.menuList[1].label)).toBeVisible();
  });

  it('should render Closed', () => {
    const { baseElement, getByText } = render(
      <Closed {...(Closed.args as NavBarSectionProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Closed.args.sectionTitle)).toBeInTheDocument();
    expect(getByText(Closed.args.menuList[0].label)).not.toBeVisible();
    expect(getByText(Closed.args.menuList[1].label)).not.toBeVisible();
  });
});
