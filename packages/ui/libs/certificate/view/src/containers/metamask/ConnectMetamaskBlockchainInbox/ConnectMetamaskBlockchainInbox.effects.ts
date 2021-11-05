import { useConnectMetamaskBlockchainInboxLogic } from '@energyweb/origin-ui-certificate-logic';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import { useCertificateAppEnv } from '../../../context';

export const useConnectMetamaskPlaceHolderEffects = () => {
  const { allowedChainIds } = useCertificateAppEnv();

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('md'));

  const { clickHandler, buttonText, title } =
    useConnectMetamaskBlockchainInboxLogic(allowedChainIds);

  return { clickHandler, buttonText, title, mobileView };
};
