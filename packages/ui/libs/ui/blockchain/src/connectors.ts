import { InjectedConnector } from '@web3-react/injected-connector';

const supportedNetworks = process.env.NX_SUPPORTED_NETWORK_IDS.split(';').map(
  (id) => Number(id)
);

export const injectedConnector = new InjectedConnector({
  supportedChainIds: supportedNetworks,
});
