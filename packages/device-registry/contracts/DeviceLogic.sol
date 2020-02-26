pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "@energyweb/user-registry/contracts/RoleManagement.sol";

import "./DeviceDefinitions.sol";
import "./IDeviceLogic.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract DeviceLogic is Initializable, RoleManagement, IDeviceLogic {

    bool private _initialized;
    address private _userLogic;

    event LogDeviceCreated(address _sender, uint indexed _deviceId);
    event LogDeviceFullyInitialized(uint indexed _deviceId);

    DeviceDefinitions.Device[] private allDevices;

    /// @notice constructor
    function initialize(address userLogicAddress) public initializer {
        require(userLogicAddress != address(0), "initialize: Cannot use address 0x0 as userLogicAddress.");
        _userLogic = userLogicAddress;

        RoleManagement.initialize(userLogicAddress);
        _initialized = true;
    }

    function userLogicAddress() public view returns (address) {
        require(_initialized == true, "userLogicAddress: The contract has not been initialized yet.");
        require(address(_userLogic) != address(0), "userLogicAddress: The device logic address is set to 0x0 address.");

        return address(_userLogic);
    }

    /**
        public functions
    */

    /// @notice gets the Device-struct as memory
    /// @param _deviceId the id of an device
    /// @return the Device-struct as memory
    function getDevice(uint _deviceId) external view returns (DeviceDefinitions.Device memory device) {
        return getDeviceById(_deviceId);
    }

    /// @notice creates an device with the provided parameters
	/// @param _smartMeter smartmeter of the device
	/// @param _owner device-owner
	/// @return generated device-id
    function createDevice(
        address _smartMeter,
        address _owner
    ) external returns (uint deviceId) {
        require(isRole(RoleManagement.Role.DeviceManager, _owner), "device owner has to have device manager role");
        require(
            _owner == msg.sender ||
            isRole(RoleManagement.Role.DeviceManager, msg.sender) ||
            isRole(RoleManagement.Role.DeviceAdmin, msg.sender) ||
            isRole(RoleManagement.Role.Issuer, msg.sender),
            "only device admin, manager and issuer can create a device for different owner"
        );
        require(
            isRole(RoleManagement.Role.DeviceManager, msg.sender) ||
            isRole(RoleManagement.Role.DeviceAdmin, msg.sender) ||
            isRole(RoleManagement.Role.Issuer, msg.sender), "only device admin, manager and issuer can add devices"
        );

        DeviceDefinitions.Device memory _device = DeviceDefinitions.Device({
            smartMeter: _smartMeter,
            owner: _owner
        });

        deviceId = allDevices.length;

        allDevices.push(_device);
        emit LogDeviceCreated(msg.sender, deviceId);
    }

    /// @notice Gets an device
	/// @param _deviceId The id belonging to an entry in the device registry
	/// @return Full informations of an device
    function getDeviceById(uint _deviceId) public view returns (DeviceDefinitions.Device memory) {
        return allDevices[_deviceId];
    }

	/// @notice gets the owner-address of an device
	/// @param _deviceId the id of an device
	/// @return the owner of that device
    function getDeviceOwner(uint _deviceId) external view returns (address){
        return getDeviceById(_deviceId).owner;
    }

    /// @notice function to get the amount of already onboarded devices
    /// @return the amount of devices already deployed
    function getDeviceListLength() public view returns (uint) {
        return allDevices.length;
    }
}
