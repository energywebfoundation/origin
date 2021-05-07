import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface UserStateManagementProps {}

const StyledUserStateManagement = styled.div`
  color: pink;
`;

export function UserStateManagement(props: UserStateManagementProps) {
  return (
    <StyledUserStateManagement>
      <h1>Welcome to user-state-management!</h1>
    </StyledUserStateManagement>
  );
}

export default UserStateManagement;
