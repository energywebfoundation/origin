import { ReadingsWindowEnum } from '@energyweb/origin-ui-device-data';
import { DateFormatEnum } from '@energyweb/origin-ui-utils';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TUseSmartMeterChartSelectorsArgs } from '../types';

export const useSmartMeterChartSelectors = ({
  startDate,
  endDate,
  selectedWindow,
}: TUseSmartMeterChartSelectorsArgs) => {
  const { t } = useTranslation();

  const windowButtons = [
    {
      label: t('device.detailView.smartMeter.day'),
      value: ReadingsWindowEnum.Day,
    },
    {
      label: t('device.detailView.smartMeter.week'),
      value: ReadingsWindowEnum.Week,
    },
    {
      label: t('device.detailView.smartMeter.month'),
      value: ReadingsWindowEnum.Month,
    },
    {
      label: t('device.detailView.smartMeter.year'),
      value: ReadingsWindowEnum.Year,
    },
  ];

  const dateFormat =
    selectedWindow === ReadingsWindowEnum.Day ||
    selectedWindow === ReadingsWindowEnum.Week
      ? DateFormatEnum.DATE_FORMAT_MDY
      : selectedWindow === ReadingsWindowEnum.Month
      ? DateFormatEnum.DATE_FORMAT_MONTH_AND_YEAR
      : DateFormatEnum.DATE_FORMAT_FULL_YEAR;

  const getDisplayDate = () => {
    if (selectedWindow === ReadingsWindowEnum.Week) {
      const formattedStartDate = dayjs(startDate).format(dateFormat);
      const formattedEndDate = dayjs(endDate).format(dateFormat);

      return `${formattedStartDate} - ${formattedEndDate}`;
    }

    return dayjs(startDate).format(dateFormat);
  };

  return {
    windowButtons,
    displayDate: getDisplayDate(),
  };
};
