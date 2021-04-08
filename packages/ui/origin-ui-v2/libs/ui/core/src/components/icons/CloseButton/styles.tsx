import { css, SerializedStyles } from '@emotion/react';

type ComponentStyles = () => {
  closeIconCss: SerializedStyles;
};

export const useComponentStyles: ComponentStyles = () => {
  const closeIconCss = css({
    width: 50,
  });

  return { closeIconCss };
};
