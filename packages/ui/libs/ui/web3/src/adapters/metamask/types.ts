// for Metamask use only
export interface IEthereum {
  isMetamask?: boolean;
  isConnected?: () => boolean;
  request?: (args: {
    method: string;
    params?: unknown[] | object;
  }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeEventListener?: (
    event: string,
    handler: (...args: any[]) => void
  ) => void;
}

// for Metamask use only
declare global {
  interface Window {
    ethereum: IEthereum;
  }
}
