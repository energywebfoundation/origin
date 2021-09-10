import { useImportCertificateHandler } from '@energyweb/origin-ui-certificate-data';
import { useConfirmImportModalLogic } from '@energyweb/origin-ui-certificate-logic';
import {
  CertificateModalsActionsEnum,
  useCertificateModalsDispatch,
  useCertificateModalsStore,
} from '../../../context';

export const useConfirmImportModalEffects = () => {
  const dispatchModals = useCertificateModalsDispatch();
  const {
    confirmImport: { open, certificate },
  } = useCertificateModalsStore();

  const handleClose = () => {
    dispatchModals({
      type: CertificateModalsActionsEnum.SHOW_CONFIRM_IMPORT,
      payload: {
        open: false,
        certificate: null,
      },
    });
  };

  const { submitHandler } = useImportCertificateHandler();

  const modalProps = useConfirmImportModalLogic({
    open,
    certificate,
    submitHandler,
    handleClose,
  });

  return modalProps;
};
