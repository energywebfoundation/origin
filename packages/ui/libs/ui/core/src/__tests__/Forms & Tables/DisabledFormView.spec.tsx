import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  Default,
  WithHeading,
  WithInputProps,
  WithHeadingProps,
} from '../../components/form/DisabledFormView/DisabledFormView.stories';
import { DisabledFormViewProps } from '../../components/form/DisabledFormView/DisabledFormView';

describe('DisabledFormView', () => {
  it('should render default DisabledFormView', () => {
    const { baseElement } = render(
      <Default {...(Default.args as DisabledFormViewProps)} />
    );
    expect(baseElement).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(Default.args.data[2].value)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(Default.args.data[4].value)
    ).toBeInTheDocument();

    expect(baseElement.querySelectorAll('input').length).toEqual(
      Default.args.data.length
    );
    expect(baseElement.querySelector('input')).toHaveAttribute('disabled');
    expect(baseElement.querySelector('h6')).not.toBeInTheDocument();
  });

  it('should render DisabledFormView with heading', () => {
    const { baseElement } = render(
      <WithHeading {...(WithHeading.args as DisabledFormViewProps)} />
    );

    expect(baseElement.querySelector('h6')).toBeInTheDocument();
    expect(baseElement.querySelector('h6')).toHaveTextContent(
      WithHeading.args.heading
    );
  });

  it('should render DisabledFormView with inputProps', () => {
    const { baseElement } = render(
      <WithInputProps {...(WithInputProps.args as DisabledFormViewProps)} />
    );

    expect(baseElement.querySelector('input')).toHaveAttribute('disabled');
    expect(baseElement.querySelectorAll('.MuiInput-input').length).toEqual(
      WithInputProps.args.data.length
    );
  });

  it('should render DisabledFormView with headingProps', () => {
    const { baseElement } = render(
      <WithHeadingProps {...(WithHeadingProps.args as DisabledFormViewProps)} />
    );

    expect(baseElement.querySelector('input')).toHaveAttribute('disabled');
    expect(baseElement.querySelector('h4')).toBeInTheDocument();
    expect(baseElement.querySelector('h4')).toHaveTextContent(
      WithHeadingProps.args.heading
    );
  });
});
