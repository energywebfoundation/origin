import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import axios from 'axios';
import Web3 from 'web3';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3030';

export async function getMarketLogicInstance(
    originIssuerContractLookupAddress: string,
    web3: Web3
) {
    const response = await axios.get(
        `${API_BASE_URL}/OriginContractLookup/${originIssuerContractLookupAddress.toLowerCase()}`
    );

    const marketBlockchainProperties: Configuration.BlockchainProperties = (await marketCreateBlockchainProperties(
        web3,
        response.data.marketContractLookup
    )) as any;

    return marketBlockchainProperties.marketLogicInstance;
}

export async function getOriginContractLookupAddressFromAPI(): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/OriginContractLookup/`);

    if (!response.data) {
        return null;
    }

    const originContracts = Object.keys(response.data);

    if (originContracts.length > 0) {
        return originContracts[originContracts.length - 1];
    }
}
