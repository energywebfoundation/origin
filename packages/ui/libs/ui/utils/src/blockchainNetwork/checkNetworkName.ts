export enum OriginPrimaryNetworksEnum {
  volta = 73799,
  ewc = 246,
}

export const checkNetworkName = (netId: OriginPrimaryNetworksEnum): string => {
  switch (netId) {
    case OriginPrimaryNetworksEnum.volta:
      return 'Please connect to Volta network.';
    case OriginPrimaryNetworksEnum.ewc:
      return 'Please connect to Energy Web Chain network.';
    default:
      return `Please connect to blockchain network with ${netId} id.`;
  }
};
