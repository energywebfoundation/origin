import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './SingleColumnForm.stories';

describe('DoubleColumnForm', () => {
  it('should render default DoubleColumnForm', () => {
    const { baseElement } = render(<Default {...Default.args} />);
    expect(baseElement).toBeInTheDocument();

    Default.args.fields.map((field) => {
      expect(screen.getByText(field.label)).toBeInTheDocument();
    });
  });
});
