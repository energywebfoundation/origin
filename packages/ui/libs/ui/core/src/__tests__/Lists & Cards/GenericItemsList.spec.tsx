import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/list/GenericItemsList/GenericItemsList.stories';
import { GenericItemsListProps } from '../../components/list/GenericItemsList/GenericItemsList';

const { Default, Title, Checkboxes, Pagination, EmptyListFallback } =
  composeStories(stories);

const itemsInLists = Checkboxes.args.listContainers.reduce(
  (acc, current) => acc + current.containerItems.length,
  0
);

describe('GenericItemsList', () => {
  it('should render default GenericItemsList', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as GenericItemsListProps<any, any>)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiList-root')).toHaveLength(
      Default.args.listContainers.length + 1
    );

    expect(getByText('Container Header 1')).toBeInTheDocument();
    expect(getByText('Container Header 2')).toBeInTheDocument();
    expect(getByText('Container Header 3')).toBeInTheDocument();
    expect(getByText('Item A1')).toBeInTheDocument();
    expect(getByText('Item A2')).toBeInTheDocument();
    expect(getByText('Item A3')).toBeInTheDocument();
  });

  it('should render with title', () => {
    const { baseElement } = render(
      <Title {...(Title.args as GenericItemsListProps<any, any>)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('h4')).toBeInTheDocument();
    expect(baseElement.querySelector('h4')).toHaveTextContent(
      Title.args.listTitle
    );
  });

  it('should render with checkboxes', () => {
    const { baseElement, getAllByTestId } = render(
      <Checkboxes {...(Checkboxes.args as GenericItemsListProps<any, any>)} />
    );

    const itemsCount = itemsInLists + Checkboxes.args.listContainers.length + 1;

    expect(baseElement).toBeInTheDocument();
    expect(getAllByTestId('CheckBoxOutlineBlankIcon')).toHaveLength(itemsCount);
  });

  it('should check first group checkboxes', () => {
    const { baseElement, getAllByTestId } = render(
      <Checkboxes {...(Checkboxes.args as GenericItemsListProps<any, any>)} />
    );

    const itemsCount =
      Checkboxes.args.listContainers[0].containerItems.length + 1;

    fireEvent.click(baseElement.querySelectorAll('input')[1]);
    expect(getAllByTestId('CheckBoxIcon')).toHaveLength(itemsCount);
  });

  it('should check all checkboxes', () => {
    const { baseElement, getAllByTestId } = render(
      <Checkboxes {...(Checkboxes.args as GenericItemsListProps<any, any>)} />
    );

    const itemsCount = itemsInLists + Checkboxes.args.listContainers.length + 1;

    fireEvent.click(
      baseElement.querySelectorAll('.PrivateSwitchBase-input')[0]
    );
    expect(getAllByTestId('CheckBoxIcon')).toHaveLength(itemsCount);
  });

  it('should render with pagination', () => {
    const { baseElement, getByText } = render(
      <Pagination {...(Pagination.args as GenericItemsListProps<any, any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiPagination-root')
    ).toBeInTheDocument();
    expect(
      baseElement.querySelectorAll('.MuiPaginationItem-root')
    ).toHaveLength(Pagination.args.listContainers.length + 2);

    expect(baseElement.querySelector('.Mui-selected')).toHaveTextContent('1');
    expect(
      baseElement.querySelectorAll('.MuiPaginationItem-root')[0]
    ).toBeDisabled();

    expect(getByText('Container Header 1')).toBeInTheDocument();
    expect(getByText('Item A1')).toBeInTheDocument();
  });

  it('should switch to page 2', () => {
    const { baseElement } = render(
      <Pagination {...(Pagination.args as GenericItemsListProps<any, any>)} />
    );
    fireEvent.click(baseElement.querySelector('[aria-label="Go to page 2"]'));
    expect(baseElement.querySelector('.Mui-selected')).toHaveTextContent('2');
    expect(
      baseElement.querySelectorAll('.MuiPaginationItem-root')[0]
    ).not.toBeDisabled();
  });

  it('should render with fallback', () => {
    const { baseElement, getByText } = render(
      <EmptyListFallback
        {...(EmptyListFallback.args as GenericItemsListProps<any, any>)}
      />
    );

    expect(baseElement).toBeInTheDocument();
    expect(EmptyListFallback.args.listContainers.length).toBe(0);
    expect(getByText('List is empty')).toBeInTheDocument();
  });
});
