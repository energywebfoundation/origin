import {
  useConfirmEmailHandler,
  useUser,
} from '@energyweb/origin-ui-user-data';
import { useQueryParams } from '@energyweb/origin-ui-utils';
import React, { useEffect } from 'react';

export const ConfirmEmailPage = () => {
  const queryParams = useQueryParams();
  const token = queryParams.get('token');
  const { user, userLoading } = useUser();
  const confirmHandler = useConfirmEmailHandler(user);

  useEffect(() => {
    if (token && !userLoading) {
      confirmHandler(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userLoading]);

  return <div></div>;
};
