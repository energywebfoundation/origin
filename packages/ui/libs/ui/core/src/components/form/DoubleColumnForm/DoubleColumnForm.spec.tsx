import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './DoubleColumnForm.stories';

describe('DoubleColumnForm', () => {
  it('should render default DoubleColumnForm', () => {
    const { baseElement } = render(<Default {...Default.args} />);
    expect(baseElement).toBeInTheDocument();

    expect(baseElement.querySelectorAll('.MuiGrid-item').length).toEqual(2);

    Default.args.fields.forEach((field) => {
      expect(screen.getByText(field.label)).toBeInTheDocument();
    });
  });
});
