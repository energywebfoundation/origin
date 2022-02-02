import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/form/FormSelect/FormSelect.stories';
import { FormSelectProps } from '../../components/form/FormSelect/FormSelect';

const { Regular, Autocomplete, AutocompleteMultipleValues } =
  composeStories(stories);

describe('FormSelect', () => {
  it('should render default FormSelect', () => {
    const { baseElement } = render(
      <Regular {...(Regular.args as FormSelectProps<stories.TestFormValues>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(screen.getByTestId('ArrowDropDownIcon')).toBeInTheDocument();
    expect(screen.getByLabelText(Regular.args.field.label)).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toBeInTheDocument();
  });

  it('should select first option', async () => {
    const { baseElement, getByRole, getByText } = render(
      <Regular {...(Regular.args as FormSelectProps<stories.TestFormValues>)} />
    );
    fireEvent.mouseDown(getByRole('button'));
    expect(baseElement.querySelector('ul')).toBeInTheDocument();

    fireEvent.click(getByText(Regular.args.field.options[0].label));
    expect(baseElement.querySelector('input')).toHaveValue(
      Regular.args.field.options[0].value.toString()
    );
  });

  it('should render autocomplete and choose value', () => {
    const { baseElement, getByRole, getByText } = render(
      <Autocomplete
        {...(Autocomplete.args as FormSelectProps<stories.TestFormValues>)}
      />
    );
    expect(
      baseElement.querySelector('.MuiAutocomplete-root')
    ).toBeInTheDocument();

    fireEvent.click(getByRole('button'));
    expect(getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(getByText(Autocomplete.args.field.options[0].label));
    expect(baseElement.querySelector('.MuiChip-root')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiChip-root')).toHaveTextContent(
      Autocomplete.args.field.options[0].label
    );
  });

  it('should choose only one value', () => {
    const { baseElement, getByText } = render(
      <Autocomplete
        {...(Autocomplete.args as FormSelectProps<stories.TestFormValues>)}
      />
    );
    expect(
      baseElement.querySelector('.MuiAutocomplete-root')
    ).toBeInTheDocument();

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(Autocomplete.args.field.options[0].label));

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(Autocomplete.args.field.options[1].label));

    expect(baseElement.querySelectorAll('.MuiChip-root')).toHaveLength(1);
  });

  it('should clear value', () => {
    const { baseElement, getByText } = render(
      <Autocomplete
        {...(Autocomplete.args as FormSelectProps<stories.TestFormValues>)}
      />
    );
    expect(
      baseElement.querySelector('.MuiAutocomplete-root')
    ).toBeInTheDocument();

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(Autocomplete.args.field.options[0].label));

    const clearButton = screen.getByTestId('CloseIcon').parentElement;
    fireEvent.click(clearButton);

    expect(baseElement.querySelectorAll('.MuiChip-root')).toHaveLength(0);
  });

  it('should choose multiple values', () => {
    const { baseElement, getByText } = render(
      <AutocompleteMultipleValues
        {...(AutocompleteMultipleValues.args as FormSelectProps<stories.TestFormValues>)}
      />
    );
    expect(
      baseElement.querySelector('.MuiAutocomplete-root')
    ).toBeInTheDocument();

    const openPopupButton =
      screen.getByTestId('ArrowDropDownIcon').parentElement;

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(Autocomplete.args.field.options[0].label));

    fireEvent.click(openPopupButton);
    fireEvent.click(getByText(Autocomplete.args.field.options[1].label));

    expect(baseElement.querySelectorAll('.MuiChip-root')).toHaveLength(2);
  });
});
