import * as React from 'react';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import { User } from '@energyweb/user-registry';
import logo from '../../assets/logo.svg';
import { AccountCircle } from '@material-ui/icons';
import './Header.scss';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL } from '../features/selectors';
import { getAssetsLink, getCertificatesLink, getDemandsLink } from '../utils/routing';
import { AccountDetailsModal } from '../elements/Modal/AccountDetailsModal';
import { getCurrentUser } from '../features/users/selectors';

interface IStateProps {
    currentUser: User.Entity;
    baseURL: string;
}

type Props = RouteComponentProps & IStateProps;

interface IHeaderState {
    showAccountDetailsModal: boolean;
}

class HeaderClass extends React.Component<Props, IHeaderState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showAccountDetailsModal: false
        };
    }

    render() {
        const { baseURL, currentUser } = this.props;

        return (
            <div className="HeaderWrapper">
                <div className="Header">
                    <NavLink to={getAssetsLink(baseURL)}>
                        <img src={logo} />
                    </NavLink>
                    <ul className="NavMenu nav">
                        <li>
                            <NavLink to={getAssetsLink(baseURL)}>Assets</NavLink>
                        </li>
                        <li>
                            <NavLink to={getCertificatesLink(baseURL)}>Certificates</NavLink>
                        </li>
                        <li>
                            <NavLink to={getDemandsLink(baseURL)}>Demands</NavLink>
                        </li>
                    </ul>

                    <div
                        className="ViewProfile"
                        onClick={() => this.setState({ showAccountDetailsModal: true })}
                    >
                        <AccountCircle className="ViewProfile_icon" color="primary" />
                        {currentUser ? currentUser.organization : 'Guest'}
                    </div>
                </div>

                {currentUser && (
                    <AccountDetailsModal
                        showModal={this.state.showAccountDetailsModal}
                        callback={() => this.setState({ showAccountDetailsModal: false })}
                    />
                )}
            </div>
        );
    }
}

export const Header = withRouter(
    connect((state: IStoreState) => ({
        baseURL: getBaseURL(),
        currentUser: getCurrentUser(state)
    }))(HeaderClass)
);
