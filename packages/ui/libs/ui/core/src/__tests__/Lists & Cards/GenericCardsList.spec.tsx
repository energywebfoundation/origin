import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/list/GenericCardsList/GenericCardsList.stories';
import { GenericCardsListProps } from '../../components/list/GenericCardsList/GenericCardsList';

const { Default, Loading, Title, Checkboxes } = composeStories(stories);

describe('GenericCardsList', () => {
  it('should render default GenericCardsList', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as GenericCardsListProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiCard-root')).toHaveLength(
      Default.args.allItems.length
    );
    expect(getByText('Name of item 1')).toBeInTheDocument();
    expect(getByText('Description of item 1')).toBeInTheDocument();
  });

  it('should be selectable', () => {
    const { baseElement } = render(
      <Default {...(Default.args as GenericCardsListProps<any>)} />
    );

    fireEvent.click(baseElement.querySelectorAll('.MuiCard-root')[0]);
    expect(
      baseElement.querySelectorAll('.MuiCard-root')[0].className
    ).toContain('selected');
  });

  it('should render with loading', () => {
    const { baseElement } = render(
      <Loading {...(Loading.args as GenericCardsListProps<any>)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      Loading.args.allItems.length
    );
    expect(Loading.args.loading).toBe(true);
  });

  it('should render with title', () => {
    const { baseElement, getByText } = render(
      <Title {...(Title.args as GenericCardsListProps<any>)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(getByText(Title.args.listTitle)).toBeInTheDocument();
  });

  it('should render with checkboxes', () => {
    const { baseElement, getByText } = render(
      <Checkboxes {...(Checkboxes.args as GenericCardsListProps<any>)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(getByText(Checkboxes.args.checkAllText)).toBeInTheDocument();
    expect(
      baseElement.querySelectorAll('.PrivateSwitchBase-input')
    ).toHaveLength(Checkboxes.args.allItems.length + 1);
  });

  it('should select checkbox', () => {
    const { baseElement } = render(
      <Checkboxes {...(Checkboxes.args as GenericCardsListProps<any>)} />
    );

    fireEvent.click(
      baseElement.querySelectorAll('.PrivateSwitchBase-input')[1]
    );
    expect(baseElement.querySelector('.Mui-checked')).toBeInTheDocument();
    expect(
      baseElement.querySelectorAll('.MuiCard-root')[0].className
    ).toContain('selected');
  });

  it('should check all checkboxes', () => {
    const { getByText, getAllByTestId } = render(
      <Checkboxes {...(Checkboxes.args as GenericCardsListProps<any>)} />
    );

    fireEvent.click(getByText(Checkboxes.args.checkAllText));
    expect(getAllByTestId('CheckBoxIcon')).toHaveLength(
      Checkboxes.args.allItems.length + 1
    );
  });

  it('should select check and uncheck all checkboxes', () => {
    const { getByText, getAllByTestId } = render(
      <Checkboxes {...(Checkboxes.args as GenericCardsListProps<any>)} />
    );

    fireEvent.click(getByText(Checkboxes.args.checkAllText));
    expect(getAllByTestId('CheckBoxIcon')).toHaveLength(
      Checkboxes.args.allItems.length + 1
    );

    fireEvent.click(getByText(Checkboxes.args.checkAllText));
    expect(getAllByTestId('CheckBoxOutlineBlankIcon')).toHaveLength(
      Checkboxes.args.allItems.length + 1
    );
  });

  it('select on card should be disabled', () => {
    const { baseElement } = render(
      <Checkboxes {...(Checkboxes.args as GenericCardsListProps<any>)} />
    );

    fireEvent.click(baseElement.querySelectorAll('.MuiCard-root')[0]);
    expect(
      baseElement.querySelectorAll('.MuiCard-root')[0].className
    ).not.toContain('selected');
  });
});
