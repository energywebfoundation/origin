/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { AppContainer } from './components/AppContainer';
import { Provider } from 'react-redux';
import { createStore, Reducer } from 'redux';
import { StoreState } from './types';
import reducer from './reducers';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import {certificateCreatedOrUpdated, currentUserUpdated, consumingAssetCreatedOrUpdated, demandCreatedOrUpdated, producingAssetCreatedOrUpdated, web3ServiceUpdated} from './actions'
import {currentUserUpdated, configurationUpdated, producingAssetCreatedOrUpdated, consumingAssetCreatedOrUpdated, certificateCreatedOrUpdated} from './actions';
import './index.scss';

const store = createStore<any>(reducer);

const mapDispatchToProps = (dispatch) => ({
        actions: bindActionCreators({currentUserUpdated, configurationUpdated, producingAssetCreatedOrUpdated, certificateCreatedOrUpdated, consumingAssetCreatedOrUpdated}, dispatch)
});
  
const mapStateToProps = (state) => {
    return state;
};

// const {whyDidYouUpdate} = require('why-did-you-update')
// whyDidYouUpdate(React)
  
ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
        
            <Route path='/:contractAddress/' component={connect(mapStateToProps, mapDispatchToProps)(AppContainer)} />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);