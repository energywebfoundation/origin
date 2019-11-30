const Migrations = artifacts.require("Migrations");
const DeviceLogic = artifacts.require("DeviceLogic");

module.exports = function(deployer) {
    deployer.deploy(Migrations);

    deployer.deploy(DeviceLogic);
};
