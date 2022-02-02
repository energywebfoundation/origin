import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/ItemsListWithActions/ItemsListWithActions.stories';
import { ItemsListWithActionsProps } from '../../containers/ItemsListWithActions/ItemsListWithActions.types';

const { Default, Title, Checkboxes, Disabled, Pagination, EmptyListFallback } =
  composeStories(stories);

describe('ItemsListWithActions', () => {
  it('should render default ItemsListWithActions', () => {
    const { baseElement } = render(
      <Default {...(Default.args as ItemsListWithActionsProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('should render with title', () => {
    const { baseElement } = render(
      <Title {...(Title.args as ItemsListWithActionsProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('h4')).toBeInTheDocument();
    expect(baseElement.querySelector('h4')).toHaveTextContent(
      Title.args.listTitle
    );
  });

  it('should render with checkboxes', () => {
    const { baseElement, getByText } = render(
      <Checkboxes
        {...(Checkboxes.args as ItemsListWithActionsProps<any, any>)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Checkboxes.args.selectAllText)).toBeInTheDocument();
  });

  it('should render with disabled checkboxes', () => {
    const { baseElement, getByText } = render(
      <Disabled {...(Disabled.args as ItemsListWithActionsProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Disabled.args.selectAllText)).toBeInTheDocument();
    expect(
      baseElement.querySelectorAll('.PrivateSwitchBase-input')[0]
    ).toBeDisabled();
  });

  it('should render with pagination', () => {
    const { baseElement } = render(
      <Pagination
        {...(Pagination.args as ItemsListWithActionsProps<any, any>)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiPagination-root')
    ).toBeInTheDocument();
  });

  it('should render with fallback', () => {
    const { baseElement, getByText } = render(
      <EmptyListFallback
        {...(EmptyListFallback.args as ItemsListWithActionsProps<any, any>)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('List is empty')).toBeInTheDocument();
  });
});
