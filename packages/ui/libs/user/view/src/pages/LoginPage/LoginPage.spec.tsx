import React from 'react';
import { render } from '@testing-library/react';

import LoginPage from './LoginPage';

describe('LoginPage', () => {
  const navigateToRegisterUserPageMockFn = jest.fn();
  const navigateToResetPasswordPageMockFn = jest.fn();
  beforeEach((cb) => {
    navigateToResetPasswordPageMockFn.mockClear();
    navigateToRegisterUserPageMockFn.mockClear();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <LoginPage
        handleNavigateToResetPasswordPage={navigateToResetPasswordPageMockFn}
        handleNavigateToRegisterUserPage={navigateToRegisterUserPageMockFn}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should match snapshot', () => {
    const navigateToRegisterUserPageMockFn = jest.fn();
    const { baseElement } = render(
      <LoginPage
        handleNavigateToResetPasswordPage={navigateToResetPasswordPageMockFn}
        handleNavigateToRegisterUserPage={navigateToRegisterUserPageMockFn}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });
});
