import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  Default,
  WithTwoParagraphs,
  WithTwoDifferentButtons,
  WithIcon,
} from './GenericModal.stories';

describe('GenericModal', () => {
  it('should render default GenericModal', () => {
    const { baseElement } = render(<Default {...Default.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiDialog-container')
    ).toBeInTheDocument();
    expect(screen.getByText(Default.args.title)).toBeInTheDocument();
    expect(screen.getByText(Default.args.text)).toBeInTheDocument();
    expect(baseElement.querySelector('button')).toBeInTheDocument();
  });

  it('should render GenericModal with 2 paragraphs', () => {
    const { baseElement } = render(
      <WithTwoParagraphs {...WithTwoParagraphs.args} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(
      screen.getByText(WithTwoParagraphs.args.text[0])
    ).toBeInTheDocument();
    expect(
      screen.getByText(WithTwoParagraphs.args.text[1])
    ).toBeInTheDocument();
  });

  it('should render GenericModal with 2 different buttons', () => {
    const { baseElement } = render(
      <WithTwoDifferentButtons {...WithTwoDifferentButtons.args} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('button').length).toEqual(2);

    expect(
      screen.getByText(WithTwoDifferentButtons.args.buttons[0].label)
    ).toBeInTheDocument();
    expect(
      screen.getByText(WithTwoDifferentButtons.args.buttons[1].label)
    ).toBeInTheDocument();

    expect(
      baseElement.querySelector('.MuiButton-outlinedSecondary')
    ).toBeInTheDocument();
    expect(
      baseElement.querySelector('.MuiButton-containedPrimary')
    ).toBeInTheDocument();
  });

  it('should render GenericModal with icon', () => {
    const { baseElement } = render(<WithIcon {...WithIcon.args} />);
    expect(baseElement).toBeInTheDocument();

    expect(baseElement.querySelector('svg')).toBeInTheDocument();
    expect(baseElement.querySelector('.MuiGrid-grid-md-2')).toBeInTheDocument();
  });
});
