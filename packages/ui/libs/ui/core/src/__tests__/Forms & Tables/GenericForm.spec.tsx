import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../containers/GenericForm/GenericForm.stories';
import { GenericFormProps } from '../../containers/GenericForm';

const { Default } = composeStories(stories);

const mockHandler = jest.fn((values: stories.DefaultFormValues) => {
  Promise.resolve(values);
});

const values = {
  email: 'test@gmail.com',
  password: 'Test0198',
  url: 'http://website.com',
};

describe('GenericForm', () => {
  it('should render default GenericForm', () => {
    const { baseElement } = render(
      <Default
        {...(Default.args as GenericFormProps<stories.DefaultFormValues>)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiTextField-root')).toHaveLength(3);
    expect(baseElement.querySelector('button')).toBeInTheDocument();
  });

  it('should fill form and submit', async () => {
    const { baseElement } = render(
      <Default
        {...(Default.args as GenericFormProps<stories.DefaultFormValues>)}
        submitHandler={mockHandler}
      />
    );

    await act(async () => {
      fireEvent.input(baseElement.querySelector('input[name=email]'), {
        target: { value: values.email },
      });
      fireEvent.input(baseElement.querySelector('input[name=password]'), {
        target: { value: values.password },
      });
      fireEvent.input(baseElement.querySelector('input[name=url]'), {
        target: { value: values.url },
      });
      fireEvent.submit(screen.getByRole('button'));
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
