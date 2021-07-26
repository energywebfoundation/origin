import { useCreateBeneficiaryFormLogic } from '@energyweb/origin-ui-organization-logic';

export const useBeneficiariesPageEffects = () => {
  const submitHandler = () => {};

  const formLogic = useCreateBeneficiaryFormLogic();

  const formProps = {
    ...formLogic,
    submitHandler,
  };

  return {
    formProps,
  };
};
