import axios from 'axios';

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3030';

export async function getMarketContractLookupAddressFromAPI(): Promise<string> {
    try {
        const response = await axios.get(`${BACKEND_URL}/contract`);

        if (!response.data) {
            return null;
        }

        const marketContracts = response.data;

        if (marketContracts.length > 0) {
            return marketContracts[marketContracts.length - 1];
        }
    } catch {
        return null;
    }
}
