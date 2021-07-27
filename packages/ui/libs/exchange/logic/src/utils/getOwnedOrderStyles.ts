import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export const getOwnedOrderStyles = (
  orders: OrderBookOrderDTO[],
  userId: UserDTO['id'],
  className: string
) => {
  return (id: OrderBookOrderDTO['id']) => {
    const order = orders.find((order) => order.id === id);
    if (order.userId === userId?.toString()) return className;
  };
};
