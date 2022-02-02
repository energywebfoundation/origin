import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/buttons/ButtonsGroupWithArrows/ButtonsGroupWithArrows.stories';
import { ButtonsGroupWithArrowsProps } from '../../components/buttons/ButtonsGroupWithArrows/ButtonsGroupWithArrows';

const { Unselected, Selected, Controlled, FunctionalArrows } =
  composeStories(stories);

describe('ButtonsGroupWithArrows', () => {
  it('should render Unselected', () => {
    const { baseElement, getAllByRole, getByTestId } = render(
      <Unselected {...(Unselected.args as ButtonsGroupWithArrowsProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getAllByRole('button')).toHaveLength(
      Unselected.args.buttons.length + 2
    );
    expect(getByTestId('ChevronLeftIcon')).toBeInTheDocument();
    expect(getByTestId('ChevronRightIcon')).toBeInTheDocument();
  });

  it('should render Selected', () => {
    const { baseElement, getAllByRole, getByTestId } = render(
      <Selected {...(Selected.args as ButtonsGroupWithArrowsProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.Mui-selected')).toBeInTheDocument();
    expect(getAllByRole('button')).toHaveLength(
      Selected.args.buttons.length + 2
    );
    expect(getByTestId('ChevronLeftIcon')).toBeInTheDocument();
    expect(getByTestId('ChevronRightIcon')).toBeInTheDocument();
  });

  it('should render Controlled and select button', () => {
    const { baseElement } = render(
      <Controlled {...(Controlled.args as ButtonsGroupWithArrowsProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();

    const buttons = baseElement.querySelectorAll(
      '.MuiToggleButtonGroup-root button'
    );

    fireEvent.click(buttons[1]);
    expect(buttons[1].className).toContain('Mui-selected');
  });

  it('should render FunctionalArrows and select arrow', () => {
    const { baseElement, getByTestId, getByText } = render(
      <FunctionalArrows
        {...(FunctionalArrows.args as ButtonsGroupWithArrowsProps<any>)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('h5').textContent).toContain('count is 0');

    fireEvent.click(getByTestId('ChevronRightIcon'));

    expect(baseElement.querySelector('h5').textContent).toContain('count is 1');

    const buttons = baseElement.querySelectorAll(
      '.MuiToggleButtonGroup-root button'
    );

    fireEvent.click(buttons[1]);
    expect(baseElement.querySelector('h5').textContent).toContain(
      buttons[1].textContent
    );
  });
});
