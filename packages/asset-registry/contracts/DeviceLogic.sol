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
    event LogDeviceSetActive(uint indexed _deviceId);
    event LogDeviceSetInactive(uint indexed _deviceId);
    event LogNewMeterRead(
        uint indexed _deviceId,
        uint _oldMeterRead,
        uint _newMeterRead,
        uint _timestamp
    );

    /// @dev mapping for smartMeter-address => Device
    mapping(address => DeviceDefinitions.Device) internal _deviceMapping;
    mapping(address => DeviceDefinitions.SmartMeterRead[]) internal _deviceSmartMeterReadsMapping;

    /// @dev list of all the smartMeters already used
    address[] internal _smartMeterAddresses;

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

	/// @notice Sets active to false
	/// @param _deviceId The id belonging to an entry in the asset registry
	/// @param _active flag if the device is device or not
    function setActive(uint _deviceId, bool _active)
        external
        onlyRole(RoleManagement.Role.DeviceAdmin)
    {
        _deviceMapping[_smAddressForDeviceId(_deviceId)].active = _active;

        if (_active) {
            emit LogDeviceSetActive(_deviceId);
        } else {
            emit LogDeviceSetInactive(_deviceId);
        }
    }

	/// @notice Logs meter read
	/// @param _deviceId The id belonging to an entry in the asset registry
	/// @param _newMeterRead The current meter read of the device
	/// @param _lastSmartMeterReadFileHash Last meter read file hash
    function saveSmartMeterRead(
        uint _deviceId,
        uint _newMeterRead,
        string calldata _lastSmartMeterReadFileHash,
        uint _timestamp
    )
        external
    {
        uint timestamp = _timestamp;

        require(timestamp >= 0, "a timestamp cannot be a negative number");
        require(timestamp <= block.timestamp + 60, "a timestamp cannot be higher than current block time plus 1 min");

        if (timestamp == 0) {
            timestamp = block.timestamp;
        }

        uint createdEnergy = _setSmartMeterRead(_deviceId, _newMeterRead, _lastSmartMeterReadFileHash, timestamp);

        _deviceSmartMeterReadsMapping[_smAddressForDeviceId(_deviceId)].push(
            DeviceDefinitions.SmartMeterRead({ energy: createdEnergy, timestamp: timestamp })
        );
    }

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
        string calldata _url
    ) external returns (uint deviceId) {
        _checkBeforeCreation(_owner, _smartMeter);

        DeviceDefinitions.Device memory _device = DeviceDefinitions.Device({
            smartMeter: _smartMeter,
            owner: _owner,
            lastSmartMeterReadWh: 0,
            active: _active,
            usageType: _usageType,
            lastSmartMeterReadFileHash: "",
            propertiesDocumentHash: _propertiesDocumentHash,
            url: _url
        });

        deviceId = _smartMeterAddresses.length;

        address smartMeter = _device.smartMeter;

        _deviceMapping[smartMeter] = _device;

        _smartMeterAddresses.push(smartMeter);
        emit LogDeviceCreated(msg.sender, deviceId);
    }

    function getSmartMeterReadsForDeviceByIndex(uint _deviceId, uint[] calldata _indexes) external view
        returns (DeviceDefinitions.SmartMeterRead[] memory)
    {
        uint length = _indexes.length;
        DeviceDefinitions.SmartMeterRead[] memory reads = new DeviceDefinitions.SmartMeterRead[](length);
        DeviceDefinitions.SmartMeterRead[] memory allReads = getSmartMeterReadsForDevice(_deviceId);

        for (uint i=0; i < length; i++) {
            reads[i] = allReads[_indexes[i]];
        }

        return reads;
    }

    function getSmartMeterReadsForDevice(uint _deviceId) public view
        returns (DeviceDefinitions.SmartMeterRead[] memory reads)
    {
        return _deviceSmartMeterReadsMapping[_smAddressForDeviceId(_deviceId)];
    }

    /// @notice Gets an device
	/// @param _deviceId The id belonging to an entry in the asset registry
	/// @return Full informations of an device
    function getDeviceById(uint _deviceId) public view returns (DeviceDefinitions.Device memory) {
        return _deviceMapping[_smAddressForDeviceId(_deviceId)];
    }

    /// @notice gets an device by its smartmeter
	/// @param _smartMeter smartmeter used for by the device
	/// @return Device-Struct
    function getDeviceBySmartMeter(address _smartMeter) public view returns (DeviceDefinitions.Device memory) {
        return _deviceMapping[_smartMeter];
    }

    /// @notice checks whether an devices with the provided smartmeter already exists
	/// @param _smartMeter smart meter address of an device
	/// @return whether there is already an device with that smartmeter
    function checkDeviceExist(address _smartMeter) public view returns (bool) {
        return _checkDeviceExistingStatus(getDeviceBySmartMeter(_smartMeter));
    }

	/// @notice gets the owner-address of an device
	/// @param _deviceId the id of an device
	/// @return the owner of that device
    function getDeviceOwner(uint _deviceId) external view returns (address){
        return getDeviceById(_deviceId).owner;
    }

	/// @notice gets the last meterreading and its hash
	/// @param _deviceId the id of an device
	/// @return the last meterreading and its hash
    function getLastMeterReadingAndHash(uint _deviceId)
        external view
        returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash)
    {
        DeviceDefinitions.Device memory device = getDeviceById(_deviceId);
        _lastSmartMeterReadWh = device.lastSmartMeterReadWh;
        _lastSmartMeterReadFileHash = device.lastSmartMeterReadFileHash;
    }

    /// @notice function to get the amount of already onboarded devices
    /// @return the amount of devices already deployed
    function getDeviceListLength() public view returns (uint) {
        return _smartMeterAddresses.length;
    }


    /**
        Internal functions
    */

    function _smAddressForDeviceId(uint _deviceId) internal view returns (address) {
        require(_deviceId < getDeviceListLength(), "getDeviceById: invalid device ID");

        return _smartMeterAddresses[_deviceId];
    }

	/// @notice checks whether an Device-struct already exists
	/// @param _device the Device-struct
	/// @return whether that struct exists
    function _checkDeviceExistingStatus(DeviceDefinitions.Device memory _device) internal pure returns (bool) {
        return !(
            address(_device.smartMeter) == address(0x0)
            && address(_device.owner) == address(0x0)
            && _device.lastSmartMeterReadWh == 0
            && !_device.active
            && bytes(_device.lastSmartMeterReadFileHash).length == 0
            && bytes(_device.propertiesDocumentHash).length == 0
            && bytes(_device.url).length == 0
        );
    }

	/// @notice sets a new meterreading for an device
	/// @param _deviceId the id of an device
	/// @param _newMeterRead the new meterreading in Wh
	/// @param _smartMeterReadFileHash the filehash for the meterreading
    function _setSmartMeterRead(
        uint _deviceId,
        uint _newMeterRead,
        string memory _smartMeterReadFileHash,
        uint _timestamp
    ) internal returns (uint) {
        DeviceDefinitions.Device storage device = _deviceMapping[_smAddressForDeviceId(_deviceId)];
        require(device.smartMeter == msg.sender, "saveSmartMeterRead: wrong sender");
        require(device.active, "saveSmartMeterRead: device not active");

        uint oldMeterRead = device.lastSmartMeterReadWh;

        /// @dev need to check if new meter read is higher then the old one
        require(_newMeterRead > oldMeterRead, "saveSmartMeterRead: meter read too low");

        device.lastSmartMeterReadWh = _newMeterRead;
        device.lastSmartMeterReadFileHash = _smartMeterReadFileHash;

        emit LogNewMeterRead(
            _deviceId,
            oldMeterRead,
            _newMeterRead,
            _timestamp
        );

        return (_newMeterRead-oldMeterRead);
    }

	/// @notice runs some checks before creating an device
	/// @param _owner the address of the device-owner
	/// @param _smartMeter the smartmeter used by that device
    function _checkBeforeCreation(address _owner, address _smartMeter) internal view {
        require(isRole(RoleManagement.Role.DeviceManager, _owner), "user does not have the required role");
        require(isRole(RoleManagement.Role.DeviceAdmin, msg.sender), "user does not have the required role");
        require(!checkDeviceExist(_smartMeter), "smartmeter does already exist");
    }
}
