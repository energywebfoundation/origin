import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/TimeframeSelect/TimeframeSelect.stories';
import { TimeframeSelectProps } from '../../components/layout/TimeframeSelect/TimeframeSelect';

const { Default, WithTitle, WithCustomDivider } = composeStories(stories);

describe('TimeframeSelect', () => {
  it('should render default TimeframeSelect', async () => {
    const { baseElement } = render(
      <Default {...(Default.args as TimeframeSelectProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should choose date', async () => {
    const { baseElement, getByRole, getByText } = render(
      <Default {...(Default.args as TimeframeSelectProps)} />
    );
    expect(baseElement).toBeInTheDocument();

    fireEvent.click(baseElement.querySelector('input'));

    await waitFor(() => getByRole('dialog'));
    fireEvent.click(baseElement.querySelector('.MuiPickersDay-today'));

    expect(getByText('OK')).toBeInTheDocument();
    fireEvent.click(getByText('OK'));

    await waitFor(() => {
      expect(baseElement.querySelector('input').value).toContain(
        new Date().getDate().toString()
      );
    });
  });

  it('should render with title', async () => {
    const { baseElement } = render(
      <WithTitle {...(WithTitle.args as TimeframeSelectProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('p')).toHaveTextContent(
      WithTitle.args.title
    );
  });

  it('should render with divider', async () => {
    const { baseElement } = render(
      <WithCustomDivider
        {...(WithCustomDivider.args as TimeframeSelectProps)}
      />
    );
    expect(baseElement).toBeInTheDocument();
  });
});
