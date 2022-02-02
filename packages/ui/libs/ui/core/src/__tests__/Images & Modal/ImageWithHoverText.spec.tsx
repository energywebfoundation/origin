import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/images/ImageWithHoverText/ImageWithHoverText.stories';
import { ImageWithHoverTextProps } from '../../components/images/ImageWithHoverText/ImageWithHoverText';

const { Default } = composeStories(stories);

describe('ImageWithHoverText', () => {
  it('should render default ImageWithHoverText', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as ImageWithHoverTextProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('img')).toBeInTheDocument();
    expect(baseElement.querySelector('img')).toHaveAttribute(
      'src',
      Default.args.src
    );
    expect(baseElement.querySelector('img')).toHaveAttribute(
      'width',
      Default.args.imageProps.width
    );
    expect(baseElement.querySelector('img')).toHaveAttribute(
      'height',
      Default.args.imageProps.height
    );
    expect(getByText(Default.args.text)).toBeInTheDocument();
  });
});
