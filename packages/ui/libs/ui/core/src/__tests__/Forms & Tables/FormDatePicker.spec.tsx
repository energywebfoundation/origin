import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { Default } from '../../components/form/FormDatePicker/FormDatePicker.stories';
import { FormDatePickerProps } from '../../components/form/FormDatePicker/FormDatePicker';

afterEach(cleanup);

describe('FormDatePicker', () => {
  it('should render default FormDatePicker', () => {
    const { baseElement } = render(
      provideTheme(<Default {...(Default.args as FormDatePickerProps<any>)} />)
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('dialog should work', () => {
    const { baseElement } = render(
      provideTheme(<Default {...(Default.args as FormDatePickerProps<any>)} />)
    );

    fireEvent.click(baseElement.querySelector('input'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should change year', () => {
    const { baseElement } = render(
      provideTheme(<Default {...(Default.args as FormDatePickerProps<any>)} />)
    );

    fireEvent.click(baseElement.querySelector('input'));

    screen.debug();
    fireEvent.click(screen.getByRole('presentation'));

    // expect(
    //   screen.getByDisplayValue(new Date().getFullYear() + 1)
    // ).toBeInTheDocument();
  });
});
