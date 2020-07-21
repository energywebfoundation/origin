import { ethers } from 'ethers';

export function getProviderWithFallback(
    primaryRpcNodeUrl: string,
    secondaryRpcNodeUrl?: string
): ethers.providers.FallbackProvider {
    const providers = [];

    if (primaryRpcNodeUrl) {
        providers.push(new ethers.providers.JsonRpcProvider(primaryRpcNodeUrl));
    }

    if (secondaryRpcNodeUrl) {
        providers.push(new ethers.providers.JsonRpcProvider(secondaryRpcNodeUrl));
    }

    return new ethers.providers.FallbackProvider(providers);
}
