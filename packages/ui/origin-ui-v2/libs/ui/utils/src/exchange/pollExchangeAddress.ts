import { AccountClient } from '@energyweb/exchange-client';

function _delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const pollExchangeAddress = async (
  accountClient: AccountClient,
  timeout: number
): Promise<boolean> => {
  await _delay(timeout);

  const {
    data: { address },
  } = await accountClient.getAccount();

  if (!address) {
    return pollExchangeAddress(accountClient, timeout);
  } else {
    return true;
  }
};
