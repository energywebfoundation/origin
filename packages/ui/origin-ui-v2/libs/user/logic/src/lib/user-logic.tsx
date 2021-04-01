import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UserLogicProps {}

const StyledUserLogic = styled.div`
  color: pink;
`;

export function UserLogic(props: UserLogicProps) {
  return (
    <StyledUserLogic>
      <h1>Welcome to user-logic!</h1>
    </StyledUserLogic>
  );
}

export default UserLogic;
