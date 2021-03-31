import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { PageContent } from '../Layout';
import { useOrganizationMenu } from './organizationMenu';
import { useLinks } from '../../hooks';

export const Organization = () => {
    const { organizationPageUrl } = useLinks();
    const organizationMenuList = useOrganizationMenu();
    const firstNotHiddenRoute = organizationMenuList.filter((i) => i.show)[0]?.key;

    return (
        <div className="PageWrapper">
            <Route
                path={`${organizationPageUrl}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = organizationMenuList.filter((item) => {
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
        </div>
    );
};
