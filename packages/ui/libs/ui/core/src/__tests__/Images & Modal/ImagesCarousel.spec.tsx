import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/images/ImagesCarousel/ImagesCarousel.stories';
import { ImagesCarouselProps } from '../../components/images/ImagesCarousel/ImagesCarousel';

const { Default } = composeStories(stories);

describe('ImagesCarousel', () => {
  it('should render default ImagesCarousel', () => {
    const { baseElement } = render(
      <Default {...(Default.args as ImagesCarouselProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('img')).toBeInTheDocument();
    expect(baseElement.querySelector('img')).toHaveAttribute(
      'width',
      Default.args.imagesProps.width
    );
  });
});
