import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { WithOrganisationName } from './UsernameAndOrg.stories';
import { UsernameAndOrgProps } from './UsernameAndOrg';

describe('UsernameAndOrg', () => {
  it('render username and orgName', () => {
    const { getByText } = render(
      <WithOrganisationName
        {...(WithOrganisationName.args as UsernameAndOrgProps)}
      />
    );

    expect(getByText(WithOrganisationName.args.username)).toBeInTheDocument();
    expect(getByText(WithOrganisationName.args.orgName)).toBeInTheDocument();
  });
});
