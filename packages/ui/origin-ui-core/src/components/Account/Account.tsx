import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import { PageContent } from '../PageContent/PageContent';
import { getUserOffchain, getIRecAccount } from '../../features/users/selectors';
import { useLinks } from '../../utils';
import { OriginConfigurationContext } from '..';
import { accountMenuCreator } from './accountMenuCreator';

export function Account() {
    const user = useSelector(getUserOffchain);
    const iRecAccount = useSelector(getIRecAccount);
    const { enabledFeatures } = useContext(OriginConfigurationContext);
    const { baseURL, getAccountLink } = useLinks();

    const accountMenuList = accountMenuCreator(user, enabledFeatures, iRecAccount);

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
