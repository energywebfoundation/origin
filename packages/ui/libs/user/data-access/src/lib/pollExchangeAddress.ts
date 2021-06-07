import {
  accountControllerGetAccount,
  AccountDTO,
} from '@energyweb/exchange-react-query-client';

function _delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const pollExchangeAddress = async (
  timeout: number
): Promise<AccountDTO> => {
  await _delay(timeout);

  const response = await accountControllerGetAccount();

  if (!response?.address) {
    return pollExchangeAddress(timeout);
  } else {
    return response;
  }
};
