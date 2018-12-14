import certificates from './Certificates';
import producingAssets from './ProducingAsset';
import consumingAssets from './ConsumingAsset';
// import demands from './Demand';
import configuration from './Configuration';
import currentUser from './User';
import { combineReducers } from 'redux';

const reducers = combineReducers({
    certificates,
    producingAssets,
    consumingAssets,
    // demands,
    // web3Service,
    currentUser,
    configuration
});

export default reducers;
