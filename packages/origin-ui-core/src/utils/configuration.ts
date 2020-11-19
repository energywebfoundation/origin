import { useContext } from 'react';
import { OriginConfigurationContext } from '../components/PackageConfigurationProvider';

export function useOriginConfiguration() {
    return useContext(OriginConfigurationContext);
}
