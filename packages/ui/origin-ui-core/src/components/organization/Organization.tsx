import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { PageContent } from '../Layout';
import { useOrganizationMenu } from './organizationMenu';
import { useLinks } from '../../hooks';
import { useOriginConfiguration } from '../../utils/configuration';
import { OrganizationModalsProvider } from '../../context';
import { OrganizationModalsCenter } from '../Modal/OrganizationModalsCenter';

export const Organization = () => {
    const { organizationPageUrl } = useLinks();
    const config = useOriginConfiguration();
    const organizationMenuList = useOrganizationMenu(config);
    const displayableMenuList = organizationMenuList.filter((i) => i.show);
    const firstNotHiddenRoute = displayableMenuList[0]?.key;

    return (
        <div className="PageWrapper">
            <OrganizationModalsProvider>
                <Route
                    path={`${organizationPageUrl}/:key/:id?`}
                    render={(props) => {
                        const key = props.match.params.key;
                        const matches = displayableMenuList.filter((item) => {
                            return item.key === key;
                        });

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={organizationPageUrl}
                            />
                        );
                    }}
                />

                {firstNotHiddenRoute && (
                    <Route
                        exact={true}
                        path={`${organizationPageUrl}`}
                        render={() => (
                            <Redirect
                                to={{
                                    pathname: `${organizationPageUrl}/${firstNotHiddenRoute}`
                                }}
                            />
                        )}
                    />
                )}
                <OrganizationModalsCenter />
            </OrganizationModalsProvider>
        </div>
    );
};
