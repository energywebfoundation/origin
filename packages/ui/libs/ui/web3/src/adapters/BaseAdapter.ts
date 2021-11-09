import { UpdateWeb3Values } from '../state';
import { IEthereum } from './metamask';

export abstract class BaseAdapter {
  protected readonly allowedChainIds: number[];
  protected onError: (error: any) => void;

  constructor(allowedChainIDs: number[], onError?: (error: any) => void) {
    this.allowedChainIds = allowedChainIDs;
    this.onError = onError;
  }

  protected abstract updateHandler(values: UpdateWeb3Values): void;
  protected abstract closeHandler(): void;

  public abstract enable(
    updateHandler: (values: UpdateWeb3Values) => void,
    closeHandler: () => void
  ): Promise<UpdateWeb3Values>;

  // use to remove event listeners
  public abstract disable(): void;

  // extend when add new adapter
  public abstract getProvider(): Promise<IEthereum>;

  public abstract getChainId(): Promise<number>;
  public abstract getAccount(): Promise<string>;
}
