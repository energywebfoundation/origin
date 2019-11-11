const Migrations = artifacts.require('Migrations');
const UserContract = artifacts.require('UserContract');

module.exports = deployer => {
    deployer.deploy(Migrations);
    deployer.deploy(UserContract);
};
