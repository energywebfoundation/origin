import { Configuration } from '@energyweb/device-registry';
import { ICoreState } from '../../types';

export const getConfiguration = (state: ICoreState): Configuration.Entity =>
    state.configurationState.configuration;
