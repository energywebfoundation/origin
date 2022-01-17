import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/form/FormDatePicker/FormDatePicker.stories';
import { FormDatePickerProps } from '../../components/form/FormDatePicker/FormDatePicker';

const { Default } = composeStories(stories);

describe('FormDatePicker', () => {
  it('should render default FormDatePicker', () => {
    const { baseElement } = render(
      <Default {...(Default.args as FormDatePickerProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toBeInTheDocument();
  });

  it('dialog should work', () => {
    const { baseElement } = render(
      <Default {...(Default.args as FormDatePickerProps<any>)} />
    );

    fireEvent.click(baseElement.querySelector('input'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should select current date', async () => {
    const { baseElement } = render(
      <Default {...(Default.args as FormDatePickerProps<any>)} />
    );

    fireEvent.click(baseElement.querySelector('input'));

    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(baseElement.querySelector('.MuiPickersDay-today'));

    expect(screen.getByText('OK')).toBeInTheDocument();
    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      expect(baseElement.querySelector('input').value).toContain(
        new Date().getDate().toString()
      );
    });
  });
});
