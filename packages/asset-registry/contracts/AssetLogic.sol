pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "@energyweb/user-registry/contracts/RoleManagement.sol";

import "./AssetDefinitions.sol";
import "./IAssetLogic.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract AssetLogic is Initializable, RoleManagement, IAssetLogic {

    bool private _initialized;
    address private _userLogic;

    event LogAssetCreated(address _sender, uint indexed _assetId);
    event LogAssetFullyInitialized(uint indexed _assetId);
    event LogAssetSetActive(uint indexed _assetId);
    event LogAssetSetInactive(uint indexed _assetId);
    event LogNewMeterRead(
        uint indexed _assetId,
        uint _oldMeterRead,
        uint _newMeterRead,
        uint _timestamp
    );

    /// @dev mapping for smartMeter-address => Asset
    mapping(address => AssetDefinitions.Asset) internal assetMapping;
    mapping(address => AssetDefinitions.SmartMeterRead[]) internal assetSmartMeterReadsMapping;

    /// @dev list of all the smartMeters already used
    address[] internal smartMeterAddresses;

    /// @notice constructor
    function initialize(address userLogicAddress) public initializer {
        require(userLogicAddress != address(0), "initialize: Cannot use address 0x0 as userLogicAddress.");
        _userLogic = userLogicAddress;

        RoleManagement.initialize(userLogicAddress);
        _initialized = true;
    }

    function userLogicAddress() public view returns (address) {
        require(_initialized == true, "userLogicAddress: The contract has not been initialized yet.");
        require(address(_userLogic) != address(0), "userLogicAddress: The asset logic address is set to 0x0 address.");

        return address(_userLogic);
    }

    /**
        public functions
    */

    /// @notice gets the Asset-struct as memory
    /// @param _assetId the id of an asset
    /// @return the Asset-struct as memory
    function getAsset(uint _assetId) external view returns (AssetDefinitions.Asset memory asset) {
        return getAssetById(_assetId);
    }

	/// @notice Sets active to false
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @param _active flag if the asset is asset or not
    function setActive(uint _assetId, bool _active)
        external
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
        assetMapping[smartMeterAddresses[_assetId]].active = _active;

        if (_active) {
            emit LogAssetSetActive(_assetId);
        } else {
            emit LogAssetSetInactive(_assetId);
        }
    }

	/// @notice Logs meter read
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @param _newMeterRead The current meter read of the asset
	/// @param _lastSmartMeterReadFileHash Last meter read file hash
    function saveSmartMeterRead(
        uint _assetId,
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

        uint createdEnergy = setSmartMeterReadInternal(_assetId, _newMeterRead, _lastSmartMeterReadFileHash, timestamp);

        assetSmartMeterReadsMapping[smartMeterAddresses[_assetId]].push(
            AssetDefinitions.SmartMeterRead({ energy: createdEnergy, timestamp: timestamp })
        );
    }

    /// @notice creates an asset with the provided parameters
	/// @param _smartMeter smartmeter of the asset
	/// @param _owner asset-owner
	/// @param _active flag if the asset is already active
	/// @param _propertiesDocumentHash hash of the document with the properties of an asset
	/// @param _url where to find the documentHash
	/// @return generated asset-id
    function createAsset(
        address _smartMeter,
        address _owner,
        bool _active,
        string calldata _propertiesDocumentHash,
        string calldata _url
    ) external returns (uint _assetId) {
        checkBeforeCreation(_owner, _smartMeter);

        AssetDefinitions.Asset memory _asset = AssetDefinitions.Asset({
            smartMeter: _smartMeter,
            owner: _owner,
            lastSmartMeterReadWh: 0,
            active: _active,
            lastSmartMeterReadFileHash: "",
            propertiesDocumentHash: _propertiesDocumentHash,
            url: _url
        });

        _assetId = smartMeterAddresses.length;

        address smartMeter = _asset.smartMeter;

        assetMapping[smartMeter] = _asset;
        smartMeterAddresses.push(smartMeter);

        emit LogAssetCreated(msg.sender, _assetId);
    }

    function getSmartMeterReadsForAsset(uint _assetId) external view
        returns (AssetDefinitions.SmartMeterRead[] memory reads)
    {
        return assetSmartMeterReadsMapping[smartMeterAddresses[_assetId]];
    }

    /// @notice Gets an asset
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @return Full informations of an asset
    function getAssetById(uint _assetId) public view returns (AssetDefinitions.Asset memory) {
        return assetMapping[smartMeterAddresses[_assetId]];
    }

    /// @notice gets an asset by its smartmeter
	/// @param _smartMeter smartmeter used for by the asset
	/// @return Asset-Struct
    function getAssetBySmartMeter(address _smartMeter) public view returns (AssetDefinitions.Asset memory) {
        return assetMapping[_smartMeter];
    }

    /// @notice checks whether an assets with the provided smartmeter already exists
	/// @param _smartMeter smart meter address of an asset
	/// @return whether there is already an asset with that smartmeter
    function checkAssetExist(address _smartMeter) public view returns (bool) {
        return checkAssetExistingStatus(getAssetBySmartMeter(_smartMeter));
    }

	/// @notice gets the owner-address of an asset
	/// @param _assetId the id of an asset
	/// @return the owner of that asset
    function getAssetOwner(uint _assetId) external view returns (address){
        return getAssetById(_assetId).owner;
    }

	/// @notice gets the last meterreading and its hash
	/// @param _assetId the id of an asset
	/// @return the last meterreading and its hash
    function getLastMeterReadingAndHash(uint _assetId)
        external view
        returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash)
    {
        AssetDefinitions.Asset memory asset = getAssetById(_assetId);
        _lastSmartMeterReadWh = asset.lastSmartMeterReadWh;
        _lastSmartMeterReadFileHash = asset.lastSmartMeterReadFileHash;
    }

    /// @notice function to get the amount of already onboarded assets
    /// @return the amount of assets already deployed
    function getAssetListLength() external view returns (uint) {
        return smartMeterAddresses.length;
    }


    /**
        Internal functions
    */

	/// @notice checks whether an Asset-struct already exists
	/// @param _Asset the Asset-struct
	/// @return whether that struct exists
    function checkAssetExistingStatus(AssetDefinitions.Asset memory _Asset) internal pure returns (bool) {
        return !(
            address(_Asset.smartMeter) == address(0x0)
            && address(_Asset.owner) == address(0x0)
            && _Asset.lastSmartMeterReadWh == 0
            && !_Asset.active
            && bytes(_Asset.lastSmartMeterReadFileHash).length == 0
            && bytes(_Asset.propertiesDocumentHash).length == 0
            && bytes(_Asset.url).length == 0
        );
    }

	/// @notice sets a new meterreading for an asset
	/// @param _assetId the id of an asset
	/// @param _newMeterRead the new meterreading in Wh
	/// @param _smartMeterReadFileHash the filehash for the meterreading
    function setSmartMeterReadInternal(
        uint _assetId,
        uint _newMeterRead,
        string memory _smartMeterReadFileHash,
        uint _timestamp
    ) internal returns (uint) {
        AssetDefinitions.Asset storage asset = assetMapping[smartMeterAddresses[_assetId]];
        require(asset.smartMeter == msg.sender, "saveSmartMeterRead: wrong sender");
        require(asset.active, "saveSmartMeterRead: asset not active");

        uint oldMeterRead = asset.lastSmartMeterReadWh;

        /// @dev need to check if new meter read is higher then the old one
        require(_newMeterRead > oldMeterRead, "saveSmartMeterRead: meter read too low");

        asset.lastSmartMeterReadWh = _newMeterRead;
        asset.lastSmartMeterReadFileHash = _smartMeterReadFileHash;

        emit LogNewMeterRead(
            _assetId,
            oldMeterRead,
            _newMeterRead,
            _timestamp
        );

        return (_newMeterRead-oldMeterRead);
    }

	/// @notice runs some checks before creating an asset
	/// @param _owner the address of the asset-owner
	/// @param _smartMeter the smartmeter used by that asset
    function checkBeforeCreation(address _owner, address _smartMeter) internal view {
        require(isRole(RoleManagement.Role.AssetManager, _owner), "user does not have the required role");
        require(isRole(RoleManagement.Role.AssetAdmin, msg.sender), "user does not have the required role");
        require(!checkAssetExist(_smartMeter), "smartmeter does already exist");
    }
}
