import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  SingleParagraph,
  MultipleParagraphs,
} from './ModalTextContent.stories';

describe('ModalTextContent', () => {
  it('should render ModalTextContent with single paragraph', () => {
    const { baseElement } = render(
      <SingleParagraph {...SingleParagraph.args} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('p').length).toEqual(1);
    expect(screen.getByText(SingleParagraph.args.text)).toBeInTheDocument();
  });

  it('should render ModalTextContent with multiple paragraphs', () => {
    const { baseElement } = render(
      <MultipleParagraphs {...MultipleParagraphs.args} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('p').length).toEqual(
      MultipleParagraphs.args.text.length
    );

    MultipleParagraphs.args.text.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
});
