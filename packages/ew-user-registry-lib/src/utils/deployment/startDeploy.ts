import { migrateUserRegistryContracts } from './migrateContracts';

const main = async () => {

    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545');
    await migrateUserRegistryContracts(web3);

};

main();