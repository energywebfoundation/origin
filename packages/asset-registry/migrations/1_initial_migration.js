const Migrations = artifacts.require("Migrations");
const AssetLogic = artifacts.require("AssetLogic");

module.exports = function(deployer) {
    deployer.deploy(Migrations);

    deployer.deploy(AssetLogic);
};
