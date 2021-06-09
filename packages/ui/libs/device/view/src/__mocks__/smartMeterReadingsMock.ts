import { ReadDTO } from '@energyweb/origin-energy-api-react-query-client';
import dayjs from 'dayjs';

const generateRandomEnergyNumber = (randomizer: number) => {
  return Math.floor(
    Math.random() * (20000000 - 1000000 + randomizer) + 1000000
  );
};

const generateRandomMockReadings = (howMany: number, randomizer: number) => {
  const randomData: ReadDTO[] = [];
  let timestamp = '1622322000000';

  for (let i = 0; i < howMany; i++) {
    randomData.push({
      timestamp,
      value: generateRandomEnergyNumber(randomizer),
    });

    timestamp = dayjs(Number(timestamp))
      .add(15, 'minutes')
      .unix()
      .toString()
      .concat('000');
  }

  return randomData;
};

export const smartMeterReadingsMock = {
  METER002: generateRandomMockReadings(24, 1020),
};
