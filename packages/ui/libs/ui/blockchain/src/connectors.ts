import { InjectedConnector } from '@web3-react/injected-connector';

const supportedNetworks = (window as any).config.SUPPORTED_NETWORK_IDS.split(
  ';'
).map((id: string) => Number(id));

export const injectedConnector = new InjectedConnector({
  supportedChainIds: supportedNetworks,
});
