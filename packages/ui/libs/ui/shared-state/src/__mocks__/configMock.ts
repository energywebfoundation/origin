import { OriginConfiguration } from '../configuration';

export const configMock: OriginConfiguration = {
  countryName: 'Country Test',
  currencies: ['USD'],
  externalDeviceIdTypes: [
    {
      type: 'Test Device ID Type',
    },
  ],
  regions: {
    North: ['NRegion 1', 'NRegion 2'],
    East: ['ERegion 0'],
  },
  complianceStandard: 'Test Standard',
  deviceTypes: [
    ['Solar'],
    ['Solar', 'Photovoltaic'],
    ['Marine', 'Tidal', 'Offshore'],
  ],
  gridOperators: ['Operator 1', 'Operator 2'],
};
