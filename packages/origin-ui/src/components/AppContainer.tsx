import * as React from 'react';
import { Certificates } from './Certificates';
import { Route, Switch, withRouter } from 'react-router-dom';
import { IStoreState } from '../types';
import { Header } from './Header';
import { Asset } from './Asset';
import './AppContainer.scss';
import { Demands } from './Demand/Demands';
import { AccountChangedModal } from '../elements/Modal/AccountChangedModal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ErrorComponent } from './ErrorComponent';
import { LoadingComponent } from './LoadingComponent';
import {
    TSetMarketContractLookupAddress,
    setMarketContractLookupAddress
} from '../features/contracts/actions';
import { getBaseURL } from '../features/selectors';
import { getAssetsLink, getCertificatesLink, getDemandsLink } from '../utils/routing';
import { getError, getLoading } from '../features/general/selectors';

interface IStateProps {
    baseURL: string;
    error: string;
    loading: boolean;
}

interface IDispatchProps {
    setMarketContractLookupAddress: TSetMarketContractLookupAddress;
}

type Props = IStateProps & IDispatchProps;

class AppContainerClass extends React.Component<Props> {
    async componentDidMount(): Promise<void> {
        const contractAddress = this.props.match.params.contractAddress;

        this.props.setMarketContractLookupAddress(contractAddress);
    }

    render(): JSX.Element {
        const { baseURL, error, loading } = this.props;

        if (error) {
            return <ErrorComponent message={error} />;
        }

        if (loading) {
            return <LoadingComponent />;
        }

        return (
            <div className={`AppWrapper`}>
                <Header />
                <Switch>
                    <Route path={getAssetsLink(baseURL)} component={Asset} />
                    <Route path={getCertificatesLink(baseURL)} component={Certificates} />
                    <Route path={getDemandsLink(baseURL)} component={Demands} />

                    <Route path={baseURL} component={Asset} />
                </Switch>
                <AccountChangedModal />
            </div>
        );
    }
}

export const AppContainer = withRouter(
    connect(
        (state: IStoreState): IStateProps => ({
            baseURL: getBaseURL(),
            error: getError(state),
            loading: getLoading(state)
        }),
        dispatch =>
            bindActionCreators(
                {
                    setMarketContractLookupAddress
                },
                dispatch
            )
    )(AppContainerClass)
);
