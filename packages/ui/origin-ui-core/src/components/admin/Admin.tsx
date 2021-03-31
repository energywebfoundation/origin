import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { PageContent } from '../Layout';
import { useAdminMenu } from './adminMenu';
import { useLinks } from '../../hooks';

export const Admin = () => {
    const { baseURL, adminPageUrl } = useLinks();

    const adminMenuList = useAdminMenu();

    return (
        <div className="PageWrapper">
            <Route
                path={`${adminPageUrl}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = adminMenuList.filter((item) => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={adminPageUrl}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={adminPageUrl}
                render={() => (
                    <Redirect to={{ pathname: `${adminPageUrl}/${adminMenuList[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${adminPageUrl}/${adminMenuList[0].key}` }} />
                )}
            />
        </div>
    );
};
