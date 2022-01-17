import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/TableComponent/TableComponent.stories';
import { TableComponentProps } from '../../containers';

const { Default, Loading } = composeStories(stories);

describe('TableComponent', () => {
  it('should render TableComponent', () => {
    const { baseElement } = render(
      <Default {...(Default.args as TableComponentProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should render TableComponent with loading', () => {
    const { baseElement } = render(
      <Loading {...(Loading.args as TableComponentProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});
