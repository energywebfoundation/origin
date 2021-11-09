// in case !window.ethereum
export class NoEthProviderError extends Error {
  constructor() {
    super();
    this.name = 'NoEthProviderError';
    this.message = 'No Ethereum Provider found on window.ethereum';
  }
}

// in case supplied chainId doesn't exist in [allowedChainIds]
export class NotAllowedChainIdError extends Error {
  public constructor(chainId: number, allowedIds?: number[]) {
    super();
    this.name = 'NotAllowedChainIdError';
    this.message = `Not allowed chainId.${
      allowedIds && allowedIds.length > 0
        ? ` Allowed ids: ${allowedIds.join(', ')}.`
        : ''
    } Selected chainId: ${chainId}`;
  }
}

/* Metamask Errors */

// Error code 4001
export class UserRejectedError extends Error {
  public constructor() {
    super();
    this.name = 'UserRejectedError';
    this.message = 'The request was rejected by the user';
  }
}

// Error code -32602
export class InvalidParametersError extends Error {
  public constructor() {
    super();
    this.name = 'InvalidParametersError';
    this.message = 'The parameters were invalid';
  }
}

// Error code -32603
export class MetamaskInternalError extends Error {
  public constructor() {
    super();
    this.name = 'MetamaskInternalError';
    this.message = 'Internal error';
  }
}
