import {
  checkNetworkName,
  OriginPrimaryNetworksEnum,
} from './checkNetworkName';

describe('checkNetworkName', function () {
  it('should match the snapshot', function () {
    expect(
      checkNetworkName(OriginPrimaryNetworksEnum.ewc)
    ).toMatchInlineSnapshot(`"Please connect to Energy Web Chain network."`);

    expect(
      checkNetworkName(OriginPrimaryNetworksEnum.volta)
    ).toMatchInlineSnapshot(`"Please connect to Volta network."`);
  });
});
