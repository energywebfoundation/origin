import { useParams } from 'react-router-dom';
import React from 'react';
import { DemandForm } from './DemandForm';
import { useSelector } from 'react-redux';
import { getDemands } from '../../features/selectors';

interface IMatchParams {
    key?: string;
    id?: string;
}

export function DemandEdit() {
    const demands = useSelector(getDemands);
    const params: IMatchParams = useParams();
    const demand = demands.find(d => d.id === params.id);

    return <DemandForm demand={demand} edit={true} />;
}
