pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./DeviceDefinitions.sol";

contract IDeviceLogic {

    event LogDeviceCreated(address _sender, uint indexed _deviceId);
    event LogDeviceFullyInitialized(uint indexed _deviceId);

    function userLogicAddress() public view returns (address);

    /**
        public functions
    */

    /// @notice gets the Device-struct as memory
    /// @param _deviceId the id of an device
    /// @return the Device-struct as memory
    function getDevice(uint _deviceId) external view returns (DeviceDefinitions.Device memory device);

    /// @notice creates an device with the provided parameters
	/// @param _smartMeter smartmeter of the device
	/// @param _owner device-owner
	/// @return generated device-id
    function createDevice(address _smartMeter, address _owner) external returns (uint deviceId);

    /// @notice Gets a device
	/// @param _deviceId The id belonging to an entry in the device registry
	/// @return Full informations of an device
    function getDeviceById(uint _deviceId) public view returns (DeviceDefinitions.Device memory);

	/// @notice gets the owner-address of an device
	/// @param _deviceId the id of an device
	/// @return the owner of that device
    function getDeviceOwner(uint _deviceId) external view returns (address);

    /// @notice function to get the amount of already onboarded devices
    /// @return the amount of devices already deployed
    function getDeviceListLength() public view returns (uint);
}
