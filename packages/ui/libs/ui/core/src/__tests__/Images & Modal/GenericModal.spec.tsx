import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/modal/GenericModal/GenericModal.stories';
import { GenericModalProps } from '../../components/modal/GenericModal/GenericModal';

const { Default, WithTwoParagraphs, WithTwoButtons, WithIcon } =
  composeStories(stories);

describe('GenericModal', () => {
  it('should render default GenericModal', () => {
    const { baseElement, getByRole } = render(
      <Default {...(Default.args as GenericModalProps)} />
    );

    fireEvent.click(getByRole('button'));

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiDialog-root')).toBeInTheDocument();

    expect(screen.getByText(Default.args.title)).toBeInTheDocument();
    expect(baseElement.querySelector('button')).toBeInTheDocument();
  });

  it('should render GenericModal with 2 paragraphs', () => {
    const { baseElement, getByRole } = render(
      <WithTwoParagraphs {...(WithTwoParagraphs.args as GenericModalProps)} />
    );
    fireEvent.click(getByRole('button'));

    expect(baseElement).toBeInTheDocument();
    expect(
      screen.getByText(WithTwoParagraphs.args.text[0])
    ).toBeInTheDocument();
    expect(
      screen.getByText(WithTwoParagraphs.args.text[1])
    ).toBeInTheDocument();
  });

  it('should render GenericModal with 2 different buttons', () => {
    const { baseElement, getByRole } = render(
      <WithTwoButtons {...(WithTwoButtons.args as GenericModalProps)} />
    );

    fireEvent.click(getByRole('button'));

    expect(baseElement).toBeInTheDocument();

    expect(
      screen.getByText(WithTwoButtons.args.buttons[0].label)
    ).toBeInTheDocument();
    expect(
      screen.getByText(WithTwoButtons.args.buttons[1].label)
    ).toBeInTheDocument();

    expect(
      baseElement.querySelector('.MuiButton-outlinedSecondary')
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiButton-containedPrimary')
    ).toBeInTheDocument();
  });

  it('should render GenericModal with icon', () => {
    const { baseElement, getByRole } = render(
      <WithIcon {...(WithIcon.args as GenericModalProps)} />
    );

    fireEvent.click(getByRole('button'));

    expect(baseElement).toBeInTheDocument();

    expect(baseElement.querySelector('svg')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiGrid-grid-md-2')).toBeInTheDocument();
  });
});
