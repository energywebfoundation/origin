const Migrations = artifacts.require('Migrations');
const UserContract = artifacts.require('UserContract');

module.exports = deployer => {
    deployer.deploy(Migrations);

    const userContractAddress = deployer.deploy(UserContract);

    console.log({
        userContractAddress
    })

    return {
        userContractAddress
    };
};
