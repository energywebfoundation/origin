import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { OriginConfigurationContext } from '..';
import { PageContent } from '../PageContent/PageContent';
import { useLinks } from '../../utils/routing';
import { getUserOffchain, getIRecAccount, getInvitations } from '../../features/users/selectors';
import { organizationMenuCreator } from './organizationMenuCreator';

export function Organization() {
    const user = useSelector(getUserOffchain);
    const invitations = useSelector(getInvitations);
    const { getOrganizationLink } = useLinks();
    const { enabledFeatures } = useContext(OriginConfigurationContext);
    const iRecAccount = useSelector(getIRecAccount);

    const organizationMenuList = organizationMenuCreator(
        user,
        invitations,
        enabledFeatures,
        iRecAccount
    );

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
