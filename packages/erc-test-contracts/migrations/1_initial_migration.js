const Migrations = artifacts.require('Migrations');
const Erc20TestToken = artifacts.require('Erc20TestToken');

module.exports = function(deployer) {
	deployer.deploy(Migrations);
	deployer.deploy(Erc20TestToken, '0xD173313A51f8fc37BcF67569b463abd89d81844f');
};
