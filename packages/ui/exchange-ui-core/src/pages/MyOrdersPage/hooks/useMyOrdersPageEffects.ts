import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchOrders, getDemands, getOrders } from '../../../features';
import { ActiveOrders, Demands } from '../../../utils';

export const useMyOrdersPageEffects = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchOrders());
    }, []);

    const allDemands = useSelector(getDemands);
    const demands = new Demands(allDemands);

    const allOrders = useSelector(getOrders);
    const activeOrders: ActiveOrders = new ActiveOrders(allOrders);

    return { allOrders, activeOrders, demands, allDemands };
};
