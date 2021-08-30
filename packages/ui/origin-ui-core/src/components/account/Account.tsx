import React, { memo, ReactElement } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { PageContent } from '../Layout';
import { useAccountMenu } from './hooks/useAccountMenu';
import { useLinks } from '../../hooks';

export const Account = memo(
    (): ReactElement => {
        const { baseURL, accountPageUrl } = useLinks();

        const accountMenuList = useAccountMenu();

        return (
            <div className="PageWrapper">
                <Route
                    path={`${accountPageUrl}/:key/:id?`}
                    render={(props) => {
                        const key = props.match.params.key;

                        return (
                            <PageContent
                                menu={accountMenuList.find((item) => item.key === key)}
                                redirectPath={accountPageUrl}
                                {...props}
                            />
                        );
                    }}
                />

                <Route
                    exact={true}
                    path={`${accountPageUrl}`}
                    render={() => (
                        <Redirect
                            to={{ pathname: `${accountPageUrl}/${accountMenuList[0].key}` }}
                        />
                    )}
                />
                <Route
                    exact={true}
                    path={`${baseURL}/`}
                    render={() => (
                        <Redirect
                            to={{ pathname: `${accountPageUrl}/${accountMenuList[0].key}` }}
                        />
                    )}
                />
            </div>
        );
    }
);

Account.displayName = 'Account';
