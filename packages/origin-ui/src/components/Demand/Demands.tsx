import * as React from 'react';
import { PageContent } from '../../elements/PageContent/PageContent';
import { DemandTable } from './DemandTable';
import { connect } from 'react-redux';
import { getDemandsLink } from '../../utils/routing';
import { getBaseURL } from '../../features/selectors';
import { DemandForm } from './DemandForm';
import { NavLink, Route, Redirect } from 'react-router-dom';
import { DemandEdit } from './DemandEdit';
import { DemandClone } from './DemandClone';
import { DemandView } from './DemandView';
import { dataTest } from '../../utils/Helper';

interface IStateProps {
    baseURL: string;
}

type Props = IStateProps;

class DemandsClass extends React.Component<Props> {
    render() {
        const { baseURL } = this.props;
        const DemandsMenu = [
            {
                key: 'list',
                label: 'List',
                component: DemandTable
            },
            {
                key: 'create',
                label: 'Create',
                component: DemandForm
            },
            {
                key: 'edit',
                label: 'Edit',
                component: DemandEdit,
                hide: true
            },
            {
                key: 'clone',
                label: 'Clone',
                component: DemandClone,
                hide: true
            },
            {
                key: 'view',
                label: 'View',
                component: DemandView,
                hide: true
            }
        ];

        return (
            <div className="PageWrapper">
                <div className="PageNav">
                    <ul className="NavMenu nav">
                        {DemandsMenu.map(menu => {
                            if (menu.hide) {
                                return null;
                            }

                            return (
                                <li key={menu.key}>
                                    <NavLink
                                        exact={true}
                                        to={`${getDemandsLink(baseURL)}/${menu.key}`}
                                        activeClassName="active"
                                        {...dataTest(`demands-link-${menu.key}`)}
                                    >
                                        {menu.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <Route
                    path={`${getDemandsLink(baseURL)}/:key/:id?`}
                    render={props => {
                        const key = props.match.params.key;
                        const matches = DemandsMenu.filter(item => {
                            return item.key === key;
                        });

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={getDemandsLink(baseURL)}
                            />
                        );
                    }}
                />

                <Route
                    exact={true}
                    path={`${getDemandsLink(baseURL)}`}
                    render={() => (
                        <Redirect
                            to={{ pathname: `${getDemandsLink(baseURL)}/${DemandsMenu[0].key}` }}
                        />
                    )}
                />
            </div>
        );
    }
}

export const Demands = connect(
    (): IStateProps => ({
        baseURL: getBaseURL()
    })
)(DemandsClass);
