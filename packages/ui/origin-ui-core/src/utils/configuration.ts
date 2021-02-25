import { useContext } from 'react';
import { OriginConfigurationContext } from '../PackageConfigurationProvider';

export function useOriginConfiguration() {
    return useContext(OriginConfigurationContext);
}
