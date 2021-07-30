import { TimeFrame } from '@energyweb/exchange-irec-react-query-client';
import {
  calculateDemandTotalVolume,
  useApiChangeDemandStatus,
  useApiUpdateDemandHandler,
} from '@energyweb/origin-ui-exchange-data';
import { useUpdateDemandFormLogic } from '@energyweb/origin-ui-exchange-logic';
import { DemandStatus } from '@energyweb/utils-general';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
  useExchangeModalsStore,
} from '../../../context';

export const useUpdateDemandEffects = () => {
  const { updateDemand } = useExchangeModalsStore();
  const dispatchModals = useExchangeModalsDispatch();

  const closeDemandModal = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_UPDATE_DEMAND,
      payload: {
        open: false,
        demand: null,
      },
    });
  };

  const { open, demand } = updateDemand;
  const initialStatus = !!demand && demand.status === DemandStatus.ACTIVE;
  const [demandStatus, setDemandStatus] = useState<boolean>(initialStatus);

  useEffect(() => {
    if (!!demand) {
      const newStatus = demand.status === DemandStatus.ACTIVE;
      if (newStatus !== demandStatus) {
        setDemandStatus(newStatus);
      }
    }
  }, [demand]);

  const demandStatusHandler = useApiChangeDemandStatus(closeDemandModal);
  const updateStatus = () => {
    const newStatus = !demandStatus;
    setDemandStatus(newStatus);

    const statusToSend = newStatus ? DemandStatus.ACTIVE : DemandStatus.PAUSED;
    demandStatusHandler(demand?.id, statusToSend);
  };

  const [totalVolume, setTotalVolume] = useState('');
  const getAndSetTotalVolume = async (
    values: [TimeFrame, Dayjs | string, Dayjs | string, string]
  ) => {
    const newTotal = await calculateDemandTotalVolume({
      period: values[0],
      startDate: dayjs(values[1]),
      endDate: dayjs(values[2]),
      volume: parseInt(values[3]),
    });
    setTotalVolume(newTotal);
  };

  const formLogic = useUpdateDemandFormLogic(demand, getAndSetTotalVolume);
  const submitHandler = useApiUpdateDemandHandler(demand, closeDemandModal);
  const buttonDisabled = demand?.status === DemandStatus.PAUSED;

  const formProps = {
    ...formLogic,
    submitHandler,
    buttonDisabled,
  };

  return {
    closeDemandModal,
    open,
    formProps,
    demandStatus,
    updateStatus,
    totalVolume,
  };
};
