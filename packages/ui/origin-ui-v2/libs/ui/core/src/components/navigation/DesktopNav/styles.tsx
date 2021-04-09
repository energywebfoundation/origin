import { css, SerializedStyles } from '@emotion/react';

type ComponentStyles = () => {
  drawerCss: SerializedStyles;
  logoCss: SerializedStyles;
  userAndOrgCss: SerializedStyles;
  listCss: SerializedStyles;
};

export const useComponentStyles: ComponentStyles = () => {
  const drawerCss = css({
    '& > .MuiDrawer-paper': {
      width: 200,
    },
  });
  const logoCss = css({
    margin: '20px',
    '& img': {
      width: 120,
    },
  });
  const userAndOrgCss = css({
    margin: '0 10px 20px 20px',
  });
  const listCss = css({
    padding: 0,
  });

  return { drawerCss, logoCss, userAndOrgCss, listCss };
};
