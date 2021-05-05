const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Registry = artifacts.require('Registry');
const Issuer = artifacts.require('Issuer');

module.exports = async (deployer) => {
    deployer.deploy(Registry).then(async () => deployProxy(Issuer, [42], { deployer }));

    console.log('Deployed', Registry.address);
};
