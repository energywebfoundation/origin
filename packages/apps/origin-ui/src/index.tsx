import { render } from 'react-dom';
import React from 'react';
import './styles/app.scss';
import { Origin } from './components/Origin';
import {
    OriginConfigurationProvider,
    useConfigurationCreation
} from './components/OriginConfigurationContext';

const originConfiguration = useConfigurationCreation();

render(
    <OriginConfigurationProvider value={originConfiguration}>
        <Origin />
    </OriginConfigurationProvider>,
    document.getElementById('root')
);
