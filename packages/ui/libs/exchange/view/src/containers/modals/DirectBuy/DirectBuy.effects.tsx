import { useApiBuyDirectHandler } from '@energyweb/origin-ui-exchange-data';
import { useBuyDirectFormLogic } from '@energyweb/origin-ui-exchange-logic';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsStore,
  useExchangeModalsDispatch,
} from '../../../context';

export const useDirectBuyEffects = () => {
  const {
    buyDirect: { open, ask },
  } = useExchangeModalsStore();
  const dispatchModals = useExchangeModalsDispatch();

  const handleModalClose = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_BUY_DIRECT,
      payload: {
        open: false,
        ask: null,
      },
    });
  };

  const formLogic = useBuyDirectFormLogic(handleModalClose, ask);

  const submitHandler = useApiBuyDirectHandler(
    ask?.id,
    ask?.price,
    handleModalClose
  );

  const formProps = {
    ...formLogic,
    submitHandler,
  };

  return { formProps, open, handleModalClose };
};
