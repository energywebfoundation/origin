const originPrimaryNetworks = {
    volta: 73799,
    ewc: 246
};

export const checkNetworkName = (netId: number): string => {
    switch (netId) {
        case originPrimaryNetworks.volta:
            return 'Please connect to Volta network.';
        case originPrimaryNetworks.ewc:
            return 'Please connect to Energy Web Chain network.';
        default:
            return `Please connect to blockchain network with ${netId} id.`;
    }
};
