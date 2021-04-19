import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  Standard,
  Error,
  Password,
  Number,
  StartAdornment,
  EndAdornment,
  BothAdornments,
} from './FormInput.stories';

describe('FormInput', () => {
  it('should render default form input', () => {
    const { baseElement } = render(<Standard {...Standard.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.Mui-error')).not.toBeInTheDocument();
  });

  it('should render form input with error state', () => {
    const { baseElement } = render(<Error {...Error.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('.Mui-error')).toBeInTheDocument();

    const error = baseElement.querySelector('.MuiFormHelperText-root');
    expect(error).toHaveTextContent(Error.args.errorText);
  });

  it('should render form input of password type', () => {
    const { baseElement } = render(<Password {...Password.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('should render form input of number type', () => {
    const { baseElement } = render(<Number {...Number.args} />);
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('input')).toHaveAttribute(
      'type',
      'number'
    );
  });

  it('should render form input with start adornment', () => {
    const { baseElement } = render(<StartAdornment {...StartAdornment.args} />);
    expect(baseElement).toBeInTheDocument();

    const adornmentWrapper = baseElement.querySelector(
      '.MuiInputAdornment-positionStart'
    );
    expect(adornmentWrapper).toBeInTheDocument();
    expect(adornmentWrapper?.querySelector('svg')).toBeInTheDocument();
  });

  it('should render form input with end adornment', () => {
    const { baseElement } = render(<EndAdornment {...EndAdornment.args} />);
    expect(baseElement).toBeInTheDocument();

    const adornmentWrapper = baseElement.querySelector(
      '.MuiInputAdornment-positionEnd'
    );
    expect(adornmentWrapper).toBeInTheDocument();
    expect(adornmentWrapper?.querySelector('svg')).toBeInTheDocument();
  });

  it('should render form input with both start and end adornments', () => {
    const { baseElement } = render(<BothAdornments {...BothAdornments.args} />);
    expect(baseElement).toBeInTheDocument();

    const startAdornmentWrapper = baseElement.querySelector(
      '.MuiInputAdornment-positionStart'
    );
    const endAdornmentWrapper = baseElement.querySelector(
      '.MuiInputAdornment-positionEnd'
    );

    expect(startAdornmentWrapper).toBeInTheDocument();
    expect(endAdornmentWrapper).toBeInTheDocument();

    expect(startAdornmentWrapper?.querySelector('svg')).toBeInTheDocument();
    expect(endAdornmentWrapper?.querySelector('svg')).toBeInTheDocument();
  });
});
