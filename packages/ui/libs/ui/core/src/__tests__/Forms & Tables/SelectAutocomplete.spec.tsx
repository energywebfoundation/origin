import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import {
  SingleSelect,
  MultipleSelect,
  WithLimit,
  WithPlaceholder,
  DependentSelect,
  primaryOptions,
  secondaryOptions,
} from '../../components/form/SelectAutocomplete/SelectAutocomplete.stories';
import { SelectAutocompleteProps } from '../../components/form/SelectAutocomplete/SelectAutocomplete';

describe('FormSelect', () => {
  it('should render default FormSelect', () => {
    const { baseElement } = render(
      provideTheme(
        <SingleSelect
          {...(SingleSelect.args as SelectAutocompleteProps<any>)}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
    expect(screen.getByTestId('ArrowDropDownIcon')).toBeInTheDocument();
    expect(
      screen.getByLabelText(SingleSelect.args.field.label)
    ).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toBeInTheDocument();
  });

  it('should choose only one value', () => {
    const { baseElement, getByText } = render(
      provideTheme(
        <SingleSelect
          {...(SingleSelect.args as SelectAutocompleteProps<any>)}
        />
      )
    );
    expect(
      baseElement.querySelector('.MuiAutocomplete-root')
    ).toBeInTheDocument();

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(SingleSelect.args.field.options[0].label));

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(SingleSelect.args.field.options[1].label));

    expect(baseElement.querySelectorAll('.MuiChip-root')).toHaveLength(1);
  });

  it('should choose multiple values', () => {
    const { baseElement, getByText } = render(
      provideTheme(
        <MultipleSelect
          {...(MultipleSelect.args as SelectAutocompleteProps<any>)}
        />
      )
    );

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(MultipleSelect.args.field.options[0].label));

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(MultipleSelect.args.field.options[1].label));

    expect(baseElement.querySelectorAll('.MuiChip-root')).toHaveLength(2);
  });

  it('maxValues prop should work', () => {
    const { baseElement, getByText } = render(
      provideTheme(
        <WithLimit {...(WithLimit.args as SelectAutocompleteProps<any>)} />
      )
    );

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(WithLimit.args.field.options[0].label));

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(WithLimit.args.field.options[1].label));

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(WithLimit.args.field.options[2].label));

    expect(baseElement.querySelectorAll('.MuiChip-root')).toHaveLength(2);
  });

  it('should display placeholder', () => {
    const { getByPlaceholderText } = render(
      provideTheme(
        <WithPlaceholder
          {...(WithPlaceholder.args as SelectAutocompleteProps<any>)}
        />
      )
    );

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);

    expect(
      getByPlaceholderText(WithPlaceholder.args.field.placeholder)
    ).toBeInTheDocument();
  });

  it('DependentSelect should work', () => {
    const { getAllByTestId, getByText, baseElement } = render(
      provideTheme(
        <DependentSelect
          {...(DependentSelect.args as SelectAutocompleteProps<any>)}
        />
      )
    );

    const openPopupButtons = getAllByTestId('ArrowDropDownIcon');

    fireEvent.click(openPopupButtons[0].parentElement);
    fireEvent.click(getByText(primaryOptions[0].label));

    fireEvent.click(openPopupButtons[1].parentElement);
    fireEvent.click(getByText(secondaryOptions.size[0].label));

    expect(baseElement.querySelectorAll('.MuiChip-root')[0]).toHaveTextContent(
      primaryOptions[0].label
    );
    expect(baseElement.querySelectorAll('.MuiChip-root')[1]).toHaveTextContent(
      secondaryOptions.size[0].label
    );
  });
});
