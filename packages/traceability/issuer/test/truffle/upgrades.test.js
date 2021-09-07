const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const Registry = artifacts.require('Registry');
const Issuer = artifacts.require('Issuer');
const IssuerUpgradeTest = artifacts.require('IssuerUpgradeTest');

contract('Issuer Upgrades', async () => {
    it('should upgrade contract', async () => {
        const registry = await Registry.deployed();

        const issuer = await deployProxy(Issuer, [123, registry.address]);
        const firstVersion = await issuer.version();

        assert.equal(firstVersion, 'v0.1');

        const upgradedIssuer = await upgradeProxy(issuer.address, IssuerUpgradeTest);
        const secondVersion = await upgradedIssuer.version();

        assert.equal(secondVersion, 'v0.2');
    });
});
