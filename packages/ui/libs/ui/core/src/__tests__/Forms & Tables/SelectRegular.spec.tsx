import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/form/SelectRegular/SelectRegular.stories';
import { SelectRegularProps } from '../../components/form/SelectRegular/SelectRegular';

const { Default, WithError, WithAdditionalInput } = composeStories(stories);

describe('SelectRegular', () => {
  it('should render default SelectRegular', () => {
    const { baseElement } = render(
      <Default {...(Default.args as SelectRegularProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(screen.getByTestId('ArrowDropDownIcon')).toBeInTheDocument();
    expect(screen.getByLabelText(Default.args.field.label)).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toBeInTheDocument();
  });

  it('should render with error', () => {
    const { baseElement } = render(
      <WithError {...(WithError.args as SelectRegularProps<any>)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiFormHelperText-root')
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiFormHelperText-root')
    ).toHaveTextContent(WithError.args.errorText);
  });

  it('should render with additional input', () => {
    const { baseElement, getByRole, getByText } = render(
      <WithAdditionalInput
        {...(WithAdditionalInput.args as SelectRegularProps<any>)}
      />
    );
    expect(baseElement).toBeInTheDocument();

    fireEvent.mouseDown(getByRole('button'));
    fireEvent.click(getByText('Other'));
    fireEvent.click(document);

    expect(baseElement.querySelectorAll('.MuiTextField-root')).toHaveLength(2);
  });
});
