import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/list/ListItemsContainer/ListItemsContainer.stories';
import { ListItemsContainerProps } from '../../components/list/ListItemsContainer/ListItemsContainer';

const { Default, Checkboxes, Checked, Disabled } = composeStories(stories);

describe('ListItemsContainer', () => {
  it('should render default ListItemsContainer', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as ListItemsContainerProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiList-root')).toBeInTheDocument();
    expect(getByText('Container header')).toBeInTheDocument();
    expect(getByText('First item of container')).toBeInTheDocument();
    expect(getByText('Second item of container')).toBeInTheDocument();
  });

  it('should render with checkboxes', () => {
    const { baseElement } = render(
      <Checkboxes {...(Checkboxes.args as ListItemsContainerProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiCheckbox-root')).toHaveLength(
      Checkboxes.args.containerItems.length + 1
    );
  });

  it('should render with checked checkboxes', () => {
    const { baseElement } = render(
      <Checked {...(Checked.args as ListItemsContainerProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.Mui-checked')).toHaveLength(
      Checkboxes.args.containerItems.length + 1
    );
  });

  it('should render with checked disabled checkboxes', () => {
    const { baseElement } = render(
      <Disabled {...(Disabled.args as ListItemsContainerProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.Mui-disabled')).toHaveLength(
      Checkboxes.args.containerItems.length + 1
    );
  });
});
