import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useLinks } from '../../utils/routing';
import { PageContent } from '../Layout';
import { useOrganizationMenu } from './organizationMenu';

export function Organization() {
    const { getOrganizationLink } = useLinks();

    const organizationMenuList = useOrganizationMenu();

    const firstNotHiddenRoute = organizationMenuList.filter((i) => i.show)[0]?.key;

    return (
        <div className="PageWrapper">
            <Route
                path={`${getOrganizationLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = organizationMenuList.filter((item) => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getOrganizationLink()}
                        />
                    );
                }}
            />

            {firstNotHiddenRoute && (
                <Route
                    exact={true}
                    path={`${getOrganizationLink()}`}
                    render={() => (
                        <Redirect
                            to={{
                                pathname: `${getOrganizationLink()}/${firstNotHiddenRoute}`
                            }}
                        />
                    )}
                />
            )}
        </div>
    );
}
