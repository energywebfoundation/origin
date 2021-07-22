import { AggregatedReadDTO } from '@energyweb/origin-energy-api-react-query-client';

const generateRandomEnergyNumber = (randomizer: number) => {
  return Math.floor(Math.random() * (5000000 - 100000 + randomizer) + 100000);
};

export const generateRandomMockEnergyBlocks = (
  howMany: number,
  randomizer: number
) => {
  const randomData: AggregatedReadDTO[] = [];
  let startDate = '2021-06-09T00:00:00.000Z';
  let endDate = '2021-06-09T01:00:00.000Z';

  for (let i = 0; i < howMany; i++) {
    randomData.push({
      start: startDate,
      stop: endDate,
      value: generateRandomEnergyNumber(randomizer),
    });
    startDate = new Date(
      new Date(startDate).getTime() + 60 * 60000
    ).toISOString();
    endDate = new Date(new Date(endDate).getTime() + 60 * 60000).toISOString();
  }

  return randomData;
};
