import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/list/ListCard/ListCard.stories';
import { ListCardProps } from '../../components/list/ListCard/ListCard';

const { Default, Selected, Checkbox } = composeStories(stories);

const handleSelectMock = jest.fn();

describe('ListCard', () => {
  it('should render default ListCard', () => {
    const { baseElement } = render(
      <Default {...(Default.args as ListCardProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiCard-root')).toBeInTheDocument();
    expect(baseElement.querySelector('p').textContent).toContain('Card number');
  });

  it('handleSelect handler should work', () => {
    const { baseElement } = render(
      <Default
        {...(Default.args as ListCardProps<any>)}
        handleSelect={handleSelectMock}
      />
    );

    fireEvent.click(baseElement.querySelector('.MuiCard-root'));
    expect(handleSelectMock).toHaveBeenCalled();
  });

  it('should render selected card', () => {
    const { baseElement } = render(
      <Selected {...(Selected.args as ListCardProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiCard-root')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiCard-root').className).toContain(
      'selected'
    );
  });

  it('should render card with checkbox', () => {
    const { baseElement, getByTestId } = render(
      <Checkbox {...(Checkbox.args as ListCardProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiCheckbox-root')).toBeInTheDocument();
    expect(getByTestId('CheckBoxOutlineBlankIcon')).toBeInTheDocument();
  });

  it('select on card should not work', () => {
    const { baseElement } = render(
      <Checkbox {...(Checkbox.args as ListCardProps<any>)} />
    );
    fireEvent.click(baseElement.querySelector('.MuiCard-root'));
    expect(baseElement.querySelector('.MuiCard-root').className).not.toContain(
      'selected'
    );
  });
});
