import { useContext } from 'react';
import { OriginConfigurationContext } from '../components/OriginConfigurationContext';

export function useOriginConfiguration() {
    return useContext(OriginConfigurationContext);
}
