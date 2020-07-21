import { providers } from 'ethers';

export function getProviderWithFallback(
    primaryRpcNodeUrl: string,
    secondaryRpcNodeUrl: string
): providers.FallbackProvider {
    let primaryProvider: providers.JsonRpcProvider;
    let secondaryProvider: providers.JsonRpcProvider;

    if (process.env.WEB3) {
        primaryProvider = new providers.JsonRpcProvider(primaryRpcNodeUrl);
    }

    if (process.env.WEB3_BACKUP) {
        primaryProvider = new providers.JsonRpcProvider(secondaryRpcNodeUrl);
    }

    return new providers.FallbackProvider(
        [primaryProvider, secondaryProvider].filter((prov) => prov !== undefined)
    );
}
