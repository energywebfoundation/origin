import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/MultiStepForm/MultiStepForm.stories';
import { MultiStepFormProps } from '../../containers/MultiStepForm/MultiStepForm';

const { Default } = composeStories(stories);

const mockHandler = jest.fn((values: stories.MultiStepFormValuesType) => {
  return Promise.resolve(values);
});

const values = {
  email: 'test@gmail.com',
  password: 'Test0198',
  username: 'Username',
  country: 'Austria',
  city: 'Wien',
  zipCode: 'zipCode',
  firstName: 'First',
  lastName: 'Last',
  phoneNumber: '+0123456789',
};

describe('MultiStepForm', () => {
  it('should render default MultiStepForm', () => {
    const { baseElement } = render(
      <Default
        {...(Default.args as MultiStepFormProps<stories.MultiStepFormValuesType>)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiTextField-root')).toHaveLength(3);
    expect(baseElement.querySelectorAll('button')).toHaveLength(2);
  });

  it('should fill form and submit', async () => {
    const { baseElement, getByText, getAllByTestId } = render(
      <Default
        {...(Default.args as MultiStepFormProps<stories.MultiStepFormValuesType>)}
        submitHandler={mockHandler}
      />
    );

    expect(
      baseElement.querySelector('.MuiStepLabel-label.Mui-active')
    ).toHaveTextContent(Default.args.forms[0].formTitle);

    await act(async () => {
      fireEvent.input(baseElement.querySelector('input[name=email]'), {
        target: { value: values.email },
      });
      fireEvent.input(baseElement.querySelector('input[name=password]'), {
        target: { value: values.password },
      });
      fireEvent.input(baseElement.querySelector('input[name=username]'), {
        target: { value: values.username },
      });

      fireEvent.submit(getByText(Default.args.forms[0].buttonText));
    });

    await waitFor(() => {
      expect(getAllByTestId('CheckCircleIcon')).toHaveLength(1);
      expect(
        baseElement.querySelector('.MuiStepLabel-label.Mui-active')
      ).toHaveTextContent(Default.args.forms[1].formTitle);
    });

    await act(async () => {
      fireEvent.input(baseElement.querySelector('input[name=country]'), {
        target: { value: values.country },
      });
      fireEvent.input(baseElement.querySelector('input[name=city]'), {
        target: { value: values.city },
      });
      fireEvent.input(baseElement.querySelector('input[name=zipCode]'), {
        target: { value: values.zipCode },
      });

      fireEvent.submit(getByText(Default.args.forms[1].buttonText));
    });

    await waitFor(() => {
      expect(getAllByTestId('CheckCircleIcon')).toHaveLength(2);
      expect(
        baseElement.querySelector('.MuiStepLabel-label.Mui-active')
      ).toHaveTextContent(Default.args.forms[2].formTitle);
    });

    await act(async () => {
      fireEvent.input(baseElement.querySelector('input[name=firstName]'), {
        target: { value: values.firstName },
      });
      fireEvent.input(baseElement.querySelector('input[name=lastName]'), {
        target: { value: values.lastName },
      });
      fireEvent.input(baseElement.querySelector('input[name=phoneNumber]'), {
        target: { value: values.phoneNumber },
      });

      fireEvent.submit(getByText(Default.args.forms[2].buttonText));
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(values);
  });
});
