const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Registry = artifacts.require('Registry');
const Issuer = artifacts.require('Issuer');
const PrivateIssuer = artifacts.require('PrivateIssuer');

module.exports = async (deployer) => {
    deployer.deploy(Registry, '').then(async () => {
        await deployProxy(Issuer, [123, Registry.address], { deployer });
        await deployProxy(PrivateIssuer, [Issuer.address], { deployer });
    });
};
