import React, { FC } from 'react';
import { Global, css } from '@emotion/react';
import { variables } from '@energyweb/origin-ui-theme';

export const OriginGlobalStyles: FC = () => {
  return (
    <Global
      styles={css({
        body: {
          backgroundColor: variables.bodyBackgroundColor,
          margin: 0,
        },
      })}
    />
  );
};
