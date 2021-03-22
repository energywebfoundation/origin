import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useLinks } from '../../utils';
import { PageContent } from '../Layout';
import { useAccountMenu } from './accountMenu';

export function Account() {
    const { baseURL, getAccountLink } = useLinks();

    const accountMenuList = useAccountMenu();

    return (
        <div className="PageWrapper">
            <Route
                path={`${getAccountLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;

                    return (
                        <PageContent
                            menu={accountMenuList.find((item) => item.key === key)}
                            redirectPath={getAccountLink()}
                            {...props}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={`${getAccountLink()}`}
                render={() => (
                    <Redirect to={{ pathname: `${getAccountLink()}/${accountMenuList[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getAccountLink()}/${accountMenuList[0].key}` }} />
                )}
            />
        </div>
    );
}
