import { useContext } from 'react';

export const assertHasContext = (
  ctx: any,
  ctxUserName: string,
  ctxProviderName
) => {
  if (useContext(ctx) === null) {
    throw new Error(
      `*${ctxUserName}* must be used within a *${ctxProviderName}Provider*`
    );
  }
};
