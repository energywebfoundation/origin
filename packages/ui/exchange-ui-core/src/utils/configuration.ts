import { useContext } from 'react';
import { OriginConfigurationContext } from '@energyweb/origin-ui-core';

export function useOriginConfiguration() {
    return useContext(OriginConfigurationContext);
}
