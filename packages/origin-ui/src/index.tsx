import { render } from 'react-dom';
import React from 'react';
import './styles/app.scss';

import {
    Origin,
    OriginConfigurationProvider,
    createOriginConfiguration
} from '@energyweb/origin-ui-core';

const originConfiguration = createOriginConfiguration();

render(
    <OriginConfigurationProvider value={originConfiguration}>
        <Origin />
    </OriginConfigurationProvider>,
    document.getElementById('root')
);
