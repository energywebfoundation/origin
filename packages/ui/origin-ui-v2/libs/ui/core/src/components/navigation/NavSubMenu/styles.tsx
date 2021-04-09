import { css, SerializedStyles } from '@emotion/react';

type ComponentStyles = () => {
  listCss: SerializedStyles;
};

export const useComponentStyles: ComponentStyles = () => {
  const listCss = css({
    padding: 0,
  });

  return { listCss };
};
