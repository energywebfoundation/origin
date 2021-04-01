import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UserDataAccessProps {}

const StyledUserDataAccess = styled.div`
  color: pink;
`;

export function UserDataAccess(props: UserDataAccessProps) {
  return (
    <StyledUserDataAccess>
      <h1>Welcome to user-data-access!</h1>
    </StyledUserDataAccess>
  );
}

export default UserDataAccess;
