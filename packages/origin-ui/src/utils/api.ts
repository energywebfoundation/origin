import axios from 'axios';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3030';

export async function getMarketContractLookupAddressFromAPI(): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/MarketContractLookup`);

    if (!response.data) {
        return null;
    }

    const marketContracts = response.data;

    if (marketContracts.length > 0) {
        return marketContracts[marketContracts.length - 1];
    }
}
