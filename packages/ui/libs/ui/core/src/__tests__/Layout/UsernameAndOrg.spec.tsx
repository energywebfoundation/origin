import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/layout/UsernameAndOrg/UsernameAndOrg.stories';
import { UsernameAndOrgProps } from '../../components/layout/UsernameAndOrg/UsernameAndOrg';

const { Default, WithOrganisationName, WithPendingDot, WithPendingTooltips } =
  composeStories(stories);

describe('UsernameAndOrg', () => {
  it('should render default UsernameAndOrg', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as UsernameAndOrgProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(WithOrganisationName.args.username)).toBeInTheDocument();
  });

  it('should render username and orgName', () => {
    const { baseElement, getByText } = render(
      <WithOrganisationName
        {...(WithOrganisationName.args as UsernameAndOrgProps)}
      />
    );
    expect(baseElement).toBeInTheDocument();
    expect(getByText(WithOrganisationName.args.username)).toBeInTheDocument();
    expect(getByText(WithOrganisationName.args.orgName)).toBeInTheDocument();
  });

  it('should render with pending dot', () => {
    const { baseElement } = render(
      <WithPendingDot {...(WithPendingDot.args as UsernameAndOrgProps)} />
    );
    expect(baseElement).toBeInTheDocument();
  });

  it('should render with pending tooltips', async () => {
    const { baseElement, getByText } = render(
      <WithPendingTooltips
        {...(WithPendingTooltips.args as UsernameAndOrgProps)}
      />
    );
    expect(baseElement).toBeInTheDocument();

    fireEvent.mouseOver(
      baseElement.querySelector(
        `[aria-label="${WithPendingTooltips.args.orgTooltip}"]`
      )
    );

    await waitFor(() => {
      expect(
        getByText(WithPendingTooltips.args.orgTooltip)
      ).toBeInTheDocument();
    });

    fireEvent.mouseOver(
      baseElement.querySelector(
        `[aria-label="${WithPendingTooltips.args.userTooltip}"]`
      )
    );

    await waitFor(() => {
      expect(
        getByText(WithPendingTooltips.args.userTooltip)
      ).toBeInTheDocument();
    });
  });
});
