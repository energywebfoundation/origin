import {
  useCachedIRecConnection,
  useCachedIRecOrg,
  useCachedUser,
  useCreateBeneficiaryHandler,
} from '@energyweb/origin-ui-organization-data';
import {
  useCreateBeneficiariesPermissionsLogic,
  useCreateBeneficiaryFormLogic,
} from '@energyweb/origin-ui-organization-logic';

export const useCreateBeneficiaryPageEffects = () => {
  const submitHandler = useCreateBeneficiaryHandler();
  const formLogic = useCreateBeneficiaryFormLogic();

  const user = useCachedUser();
  const iRecOrg = useCachedIRecOrg();
  const iRecConnection = useCachedIRecConnection();

  const { canAccessPage, requirementsProps } =
    useCreateBeneficiariesPermissionsLogic({ user, iRecOrg, iRecConnection });

  const formProps = {
    ...formLogic,
    submitHandler,
  };

  return {
    formProps,
    canAccessPage,
    requirementsProps,
  };
};
