import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface UserViewProps {}

const StyledUserView = styled.div`
  color: pink;
`;

export function UserView(props: UserViewProps) {
  return (
    <StyledUserView>
      <h1>Welcome to user-view!</h1>
    </StyledUserView>
  );
}

export default UserView;
