import { TableComponentProps } from '@energyweb/origin-ui-core';

export const pendingDevicesMock: TableComponentProps<number> = {
  header: {
    owner: 'Owner',
    facilityName: 'Facility name',
    location: 'Region, province',
    gridOperator: 'Grid Operator',
    type: 'Type',
    capacity: 'Nameplate Capacity',
    status: 'Status',
    certified: 'Certified for 2020/2021(MWh)',
    toBeCertified: 'To be certified for 2020/20219(MWh)',
  },
  totalPages: 1,
  data: [
    {
      id: 1,
      owner: 'Device Manager Organization',
      facilityName: 'Solar Device',
      location: 'Northeast, Amnat Charoen',
      gridOperator: 'TH-MEA',
      type: 'Solar - Photovoltaic - Ground mounted',
      capacity: 12,
      status: 'Submitted',
      certified: 0,
      toBeCertified: 0,
    },
  ],
};
