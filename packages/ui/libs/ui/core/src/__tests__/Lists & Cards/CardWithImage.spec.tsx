import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/card/CardWithImage/CardWithImage.stories';
import { CardWithImageProps } from '../../components/card/CardWithImage/CardWithImage';

const { WithImage, WithIcon } = composeStories(stories);

const onActionClickMock = jest.fn();

describe('CardWithImage', () => {
  it('should render default CardWithImage', () => {
    const { baseElement, getByRole, getByText } = render(
      <WithImage {...(WithImage.args as CardWithImageProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('img')).toBeInTheDocument();
    expect(baseElement.querySelector('img')).toHaveAttribute(
      'src',
      WithImage.args.imageUrl
    );
    expect(getByText(WithImage.args.heading)).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent(WithImage.args.hoverText);
    expect(
      baseElement.querySelector('.MuiCardContent-root')
    ).toBeInTheDocument();
  });

  it('action click should work', () => {
    const { getByRole } = render(
      <WithImage
        {...(WithImage.args as CardWithImageProps)}
        onActionClick={onActionClickMock}
      />
    );

    fireEvent.mouseOver(getByRole('button'));
    fireEvent.click(getByRole('button'));
    expect(onActionClickMock).toHaveBeenCalled();
  });

  it('should render with icon', () => {
    const { baseElement, getByText } = render(
      <WithIcon {...(WithIcon.args as CardWithImageProps)} />
    );

    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('svg')).toBeInTheDocument();
    expect(getByText(WithIcon.args.heading)).toBeInTheDocument();
  });
});
