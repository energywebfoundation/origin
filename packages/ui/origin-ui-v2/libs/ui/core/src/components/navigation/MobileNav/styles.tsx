import { css, SerializedStyles } from '@emotion/react';

type ComponentStyles = () => {
  drawerCss: SerializedStyles;
  listCss: SerializedStyles;
};

export const useComponentStyles: ComponentStyles = () => {
  const drawerCss = css({
    '& > .MuiDrawer-paper': {
      width: '100%',
    },
  });
  const listCss = css({
    padding: 0,
  });

  return { drawerCss, listCss };
};
