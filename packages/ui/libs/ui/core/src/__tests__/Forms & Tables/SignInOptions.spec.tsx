import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { composeStories } from '@storybook/testing-react';

import * as stories from '../../components/form/SignInOptions/SignInOptions.stories';
import { SignInOptionsProps } from '../../components/form/SignInOptions/SignInOptions';

const { Default } = composeStories(stories);

describe('SignInOptions', () => {
  it('should render default SignInOptions', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as SignInOptionsProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText('Forgot password?')).toBeInTheDocument();
    expect(getByText('Remember me')).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toBeInTheDocument();
  });

  it('should check checkbox', () => {
    const { baseElement, getByTestId } = render(
      <Default {...(Default.args as SignInOptionsProps)} />
    );
    expect(getByTestId('CheckBoxOutlineBlankIcon')).toBeInTheDocument();
    fireEvent.click(baseElement.querySelector('input'));
    expect(getByTestId('CheckBoxIcon')).toBeInTheDocument();
  });
});
