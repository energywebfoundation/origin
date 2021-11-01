import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface UiWeb3Props {}

const StyledUiWeb3 = styled.div`
  color: pink;
`;

export function UiWeb3(props: UiWeb3Props) {
  return (
    <StyledUiWeb3>
      <h1>Welcome to UiWeb3!</h1>
    </StyledUiWeb3>
  );
}

export default UiWeb3;
