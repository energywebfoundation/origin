import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import { WindRegular } from '@energyweb/origin-ui-assets';
import '@testing-library/jest-dom';

import * as stories from '../../components/card/HorizontalCard/HorizontalCard.stories';
import { HorizontalCardProps } from '../../components/card/HorizontalCard/HorizontalCard';

const { Default, WithImage, WithFallbackIcon, Selectable } =
  composeStories(stories);

describe('HorizontalCard', () => {
  it('should render default HorizontalCard', () => {
    const { baseElement } = render(
      <Default {...(Default.args as HorizontalCardProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('h5')).toBeInTheDocument();
    expect(baseElement.querySelector('h5')).toHaveTextContent('Header');
    expect(baseElement.querySelector('p')).toBeInTheDocument();
    expect(baseElement.querySelector('p')).toHaveTextContent('Content');
  });

  it('should render with image', () => {
    const { baseElement, getByRole } = render(
      <WithImage {...(WithImage.args as HorizontalCardProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByRole('img')).toBeInTheDocument();
    expect(getByRole('img')).toHaveStyle(
      `background-image: url(${WithImage.args.imageUrl});`
    );
  });

  it('should render with icon', () => {
    const { baseElement } = render(
      <WithFallbackIcon
        {...(WithFallbackIcon.args as HorizontalCardProps)}
        fallbackIcon={WindRegular}
      />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should be selectable', () => {
    const { baseElement } = render(
      <Selectable {...(Selectable.args as HorizontalCardProps)} />
    );
    expect(baseElement).toBeInTheDocument();

    fireEvent.click(baseElement.querySelector('.MuiCard-root'));
    expect(baseElement.querySelector('.MuiCard-root').className).toContain(
      'selectedCard'
    );
  });
});
