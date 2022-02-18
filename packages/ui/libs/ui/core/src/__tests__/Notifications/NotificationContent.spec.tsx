import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/notification/NotificationContent/NotificationContent.stories';
import { NotificationContentProps } from '../../components/notification/NotificationContent/NotificationContent';

const { Success, Error, Warning, Info } = composeStories(stories);

describe('NotificationContent', () => {
  it('should render Success notification', () => {
    const { baseElement, getByText, getByTestId } = render(
      <Success {...(Success.args as NotificationContentProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Success.args.message)).toBeInTheDocument();
    expect(getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });

  it('should render Error notification', () => {
    const { baseElement, getByText, getByTestId } = render(
      <Error {...(Error.args as NotificationContentProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Error.args.message)).toBeInTheDocument();
    expect(getByTestId('CancelIcon')).toBeInTheDocument();
  });

  it('should render Warning notification', () => {
    const { baseElement, getByText, getByTestId } = render(
      <Warning {...(Warning.args as NotificationContentProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Warning.args.message)).toBeInTheDocument();
    expect(getByTestId('WarningIcon')).toBeInTheDocument();
  });

  it('should render Info notification', () => {
    const { baseElement, getByText, getByTestId } = render(
      <Info {...(Info.args as NotificationContentProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(Info.args.message)).toBeInTheDocument();
    expect(getByTestId('InfoIcon')).toBeInTheDocument();
  });
});
