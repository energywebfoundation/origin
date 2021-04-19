import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface UiFormsProps {}

const StyledUiForms = styled.div`
  color: pink;
`;

export function UiForms(props: UiFormsProps) {
  return (
    <StyledUiForms>
      <h1>Welcome to ui-forms!</h1>
    </StyledUiForms>
  );
}

export default UiForms;
