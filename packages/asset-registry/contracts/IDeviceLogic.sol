pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./DeviceDefinitions.sol";

contract IDeviceLogic {

    event LogDeviceCreated(address _sender, uint indexed _deviceId);
    event LogDeviceFullyInitialized(uint indexed _deviceId);
    event LogDeviceSetActive(uint indexed _deviceId);
    event LogDeviceSetInactive(uint indexed _deviceId);
    event LogNewMeterRead(
        uint indexed _deviceId,
        uint _oldMeterRead,
        uint _newMeterRead,
        uint _timestamp
    );

    function userLogicAddress() public view returns (address);

    /**
        public functions
    */

    /// @notice gets the Device-struct as memory
    /// @param _deviceId the id of an device
    /// @return the Device-struct as memory
    function getDevice(uint _deviceId) external view returns (DeviceDefinitions.Device memory device);

	/// @notice Sets active to false
	/// @param _deviceId The id belonging to an entry in the device registry
	/// @param _active flag if the device is device or not
    function setActive(uint _deviceId, bool _active) external;

	/// @notice Logs meter read
	/// @param _deviceId The id belonging to an entry in the device registry
	/// @param _newMeterRead The current meter read of the device
	/// @param _lastSmartMeterReadFileHash Last meter read file hash
    function saveSmartMeterRead(
        uint _deviceId,
        uint _newMeterRead,
        string calldata _lastSmartMeterReadFileHash,
        uint _timestamp) external;

    /// @notice creates an device with the provided parameters
	/// @param _smartMeter smartmeter of the device
	/// @param _owner device-owner
	/// @param _active flag if the device is already active
	/// @param _usageType consuming or producing device
	/// @param _propertiesDocumentHash hash of the document with the properties of an device
	/// @param _url where to find the documentHash
	/// @return generated device-id
    function createDevice(
        address _smartMeter,
        address _owner,
        bool _active,
        DeviceDefinitions.UsageType _usageType,
        string calldata _propertiesDocumentHash,
        string calldata _url) external returns (uint deviceId);

    function getSmartMeterReadsForDevice(uint _deviceId) external view
        returns (DeviceDefinitions.SmartMeterRead[] memory reads);

    /// @notice Gets an device
	/// @param _deviceId The id belonging to an entry in the device registry
	/// @return Full informations of an device
    function getDeviceById(uint _deviceId) public view returns (DeviceDefinitions.Device memory);

    /// @notice gets an device by its smartmeter
	/// @param _smartMeter smartmeter used for by the device
	/// @return Device-Struct
    function getDeviceBySmartMeter(address _smartMeter) public view returns (DeviceDefinitions.Device memory);

    /// @notice checks whether an devices with the provided smartmeter already exists
	/// @param _smartMeter smart meter address of an device
	/// @return whether there is already an device with that smartmeter
    function checkDeviceExist(address _smartMeter) public view returns (bool);

	/// @notice gets the owner-address of an device
	/// @param _deviceId the id of an device
	/// @return the owner of that device
    function getDeviceOwner(uint _deviceId) external view returns (address);

	/// @notice gets the last meterreading and its hash
	/// @param _deviceId the id of an device
	/// @return the last meterreading and its hash
    function getLastMeterReadingAndHash(uint _deviceId)
        external view
        returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash);

    /// @notice function to get the amount of already onboarded devices
    /// @return the amount of devices already deployed
    function getDeviceListLength() public view returns (uint);
}
