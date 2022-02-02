import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/CardsListBlock/CardListBlock.stories';
import { CardsListBlockProps } from '../../containers/CardsListBlock/CardsListBlock';

const { Default, Checkboxes, DragNDrop, Loading, Title } =
  composeStories(stories);

describe('CardListBlock', () => {
  it('should render default CardListBlock', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as CardsListBlockProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiCard-root')).toHaveLength(
      Default.args.allItems.length
    );
    expect(getByText("Currently selected ID's:")).toBeInTheDocument();
  });

  it('should select cards and dislay ids', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as CardsListBlockProps<any>)} />
    );
    fireEvent.click(baseElement.querySelectorAll('.MuiCard-root')[0]);
    fireEvent.click(baseElement.querySelectorAll('.MuiCard-root')[1]);
    fireEvent.click(baseElement.querySelectorAll('.MuiCard-root')[2]);

    expect(getByText("Currently selected ID's: 1, 2, 3")).toBeInTheDocument();
  });

  it('should render with checkboxes and select all', () => {
    const { baseElement, getByText, getAllByTestId } = render(
      <Checkboxes {...(Checkboxes.args as CardsListBlockProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();

    expect(getAllByTestId('CheckBoxOutlineBlankIcon')).toHaveLength(
      Checkboxes.args.allItems.length + 1
    );

    fireEvent.click(getByText(Checkboxes.args.checkAllText));

    expect(getByText("Currently selected ID's: 1, 2, 3")).toBeInTheDocument();
    expect(getAllByTestId('CheckBoxIcon')).toHaveLength(
      Checkboxes.args.allItems.length + 1
    );
  });

  it('should render with drag and drop', () => {
    const { baseElement } = render(
      <DragNDrop {...(DragNDrop.args as CardsListBlockProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should render with loading', () => {
    const { baseElement } = render(
      <Loading {...(Loading.args as CardsListBlockProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      Loading.args.allItems.length
    );
  });

  it('should render with title', () => {
    const { baseElement, getByText } = render(
      <Title {...(Title.args as CardsListBlockProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Title.args.listTitle)).toBeInTheDocument();
  });
});
