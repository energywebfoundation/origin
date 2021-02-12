import React, { useContext } from 'react';
import { OriginFeature } from '@energyweb/utils-general';
import { Route, Redirect, RouteComponentProps, RouteProps } from 'react-router-dom';
import { useLinks, OriginConfigurationContext } from '../..';

interface IOwnProps extends RouteProps {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    forFeatures: OriginFeature[];
}

export function FeatureRoute({ component: Component, forFeatures, ...rest }: IOwnProps) {
    const { getDefaultLink } = useLinks();
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const renderComponent = (props) =>
        forFeatures.every((feature) => enabledFeatures.includes(feature)) ? (
            <Component {...props} />
        ) : (
            <Redirect to={getDefaultLink()} />
        );

    return <Route {...rest} render={renderComponent} />;
}
