import {
  useAdminGetUser,
  useAdminUpdateUser,
} from '@energyweb/origin-ui-user-data-access';
import { useAdminUpdateUserFormLogic } from '@energyweb/origin-ui-user-logic';
import { useParams } from 'react-router';

export const useAdminUpdateUserPageEffects = () => {
  const { id } = useParams();
  const { user, isLoading } = useAdminGetUser(id);
  const submitHandler = useAdminUpdateUser(id);
  const formConfig = useAdminUpdateUserFormLogic(user);

  const formProps = {
    ...formConfig,
    submitHandler,
  };

  return { formProps, isLoading };
};
