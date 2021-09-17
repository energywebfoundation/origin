import { useCreateBeneficiaryHandler } from '@energyweb/origin-ui-organization-data';
import { useCreateBeneficiaryFormLogic } from '@energyweb/origin-ui-organization-logic';

export const useCreateBeneficiaryPageEffects = () => {
  const submitHandler = useCreateBeneficiaryHandler();
  const formLogic = useCreateBeneficiaryFormLogic();

  const formProps = {
    ...formLogic,
    submitHandler,
  };

  return {
    formProps,
  };
};
