import { BigNumber } from '@ethersproject/bignumber';
import type { UpdateWeb3Values } from '../../state';
import { BaseAdapter } from '../BaseAdapter';
import { NoEthProviderError, NotAllowedChainIdError } from './errors';
import type { IEthereum } from './types';

export class MetamaskAdapter extends BaseAdapter {
  updateHandler: (values: UpdateWeb3Values) => void;
  closeHandler: () => void;

  constructor(allowedChainIds: number[], onError?: (error: any) => void) {
    super(allowedChainIds, onError);
    this.handleAccountsChange = this.handleAccountsChange.bind(this);
    this.handleChainChange = this.handleChainChange.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
  }

  private handleAccountsChange(accounts: string[]) {
    const account = accounts[0];
    if (process.env.NODE_ENV === 'development') {
      console.log(`[origin-ui-web3]: Account changed to ${account}`);
    }
    this.updateHandler({ account });
  }

  private handleChainChange(chainIdBN: BigNumber) {
    try {
      const chainId = BigNumber.from(chainIdBN).toNumber();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[origin-ui-web3]: Chain ID changed to ${chainId}`);
      }

      // MM docs strongly recommend reloading the page on chain changes
      window.location.reload();
    } catch (error) {
      console.error(error);
      this.onError && this.onError(error);
    }
  }

  private handleDisconnect() {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[origin-ui-web3]: Handling disconnect`);
    }
    this.closeHandler();
  }

  public async enable(
    updateHandler: (values: UpdateWeb3Values) => void,
    closeHandler: () => void
  ) {
    this.updateHandler = updateHandler;
    this.closeHandler = closeHandler;

    let account: string;
    let chainId: number;
    let provider: IEthereum;

    try {
      if (!window.ethereum) throw new NoEthProviderError();

      const connectedChainId = await this.getChainId();
      const connectedAccount = await this.getAccount();
      const connectedProvider = await this.getProvider();

      if (!this.allowedChainIds.includes(connectedChainId)) {
        const displayedAllChainIds: number[] | undefined =
          process.env.NODE_ENV === 'development'
            ? this.allowedChainIds
            : undefined;
        throw new NotAllowedChainIdError(
          connectedChainId,
          displayedAllChainIds
        );
      }

      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', this.handleAccountsChange);
        window.ethereum.on('chainChanged', this.handleChainChange);
        window.ethereum.on('disconnect', this.handleDisconnect);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[origin-ui-web3]: Enabling connection for account ${connectedAccount} on chain id ${connectedChainId}`
        );
      }

      account = connectedAccount;
      chainId = connectedChainId;
      provider = connectedProvider;
    } catch (error) {
      console.error(error);
      this.onError && this.onError(error);
    }

    return { account, chainId, provider };
  }

  public disable() {
    try {
      if (!window.ethereum) throw new NoEthProviderError();

      this.closeHandler();

      if (window.ethereum.removeEventListener) {
        window.ethereum.removeEventListener(
          'accountChanged',
          this.handleAccountsChange
        );
        window.ethereum.removeEventListener(
          'chainChanged',
          this.handleChainChange
        );
        window.ethereum.removeEventListener(
          'disconnect',
          this.handleDisconnect
        );
      }
    } catch (error) {
      console.error(error);
      this.onError && this.onError(error);
    }
  }

  public async getAccount() {
    let account: string;

    try {
      if (!window.ethereum) throw new NoEthProviderError();

      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      account = accounts[0];
    } catch (error) {
      console.error(error);
      this.onError && this.onError(error);
    }

    return account;
  }

  public async getProvider() {
    return window.ethereum;
  }

  public async getChainId() {
    let chainId: number;

    try {
      if (!window.ethereum) throw new NoEthProviderError();

      const receivedChainId = await window.ethereum
        .request({ method: 'eth_chainId' })
        .then((chainIdBN) => BigNumber.from(chainIdBN).toNumber());

      chainId = receivedChainId;
    } catch (error) {
      console.error(error);
      this.onError && this.onError(error);
    }

    return chainId;
  }
}
