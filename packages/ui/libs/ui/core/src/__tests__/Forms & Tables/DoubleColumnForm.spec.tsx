import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { Default as DoubleColumnForm } from '../../components/form/DoubleColumnForm/DoubleColumnForm.stories';
import { SingleColumnFormProps } from '../../components/form/SingleColumnForm/SingleColumnForm';

describe('DoubleColumnForm', () => {
  it('should render default DoubleColumnForm', () => {
    const { baseElement } = render(
      provideTheme(
        <DoubleColumnForm
          {...(DoubleColumnForm.args as SingleColumnFormProps<any>)}
        />
      )
    );
    expect(baseElement).toBeInTheDocument();
    expect(
      screen.getByLabelText(DoubleColumnForm.args.fields[1].label)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(DoubleColumnForm.args.fields[3].label)
    ).toBeInTheDocument();

    expect(baseElement.querySelectorAll('input').length).toEqual(
      DoubleColumnForm.args.fields.length
    );
  });
});
