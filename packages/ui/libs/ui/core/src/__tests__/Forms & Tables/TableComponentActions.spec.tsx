import React from 'react';
import { Remove } from '@mui/icons-material';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { provideTheme } from '../utils';

import { TableComponentActions } from '../../components/table/TableComponentActions';

const mockHandler = jest.fn();

const actions = [
  {
    name: 'Name',
    icon: <Remove />,
    onClick: mockHandler,
  },
];

describe('TableComponentActions', () => {
  it('should render default TableComponentActions', () => {
    const { baseElement } = render(
      provideTheme(<TableComponentActions id={'1'} actions={actions} />)
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('button')).toBeInTheDocument();
  });

  it('should handle action', () => {
    const { baseElement, getByRole } = render(
      provideTheme(<TableComponentActions id={'1'} actions={actions} />)
    );

    fireEvent.mouseOver(baseElement.querySelector('button'));
    fireEvent.click(getByRole('menuitem'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
