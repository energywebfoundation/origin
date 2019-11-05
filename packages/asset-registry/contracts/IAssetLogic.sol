pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./AssetStructs.sol";

contract IAssetLogic {

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

    /// @notice gets the Asset-struct as memory
    /// @param _assetId the id of an asset
    /// @return the Asset-struct as memory
    function getAsset(uint _assetId) external view returns (AssetStructs.Asset memory);

	/// @notice Sets active to false
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @param _active flag if the asset is asset or not
    function setActive(uint _assetId, bool _active) external;

	/// @notice Logs meter read
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @param _newMeterRead The current meter read of the asset
	/// @param _lastSmartMeterReadFileHash Last meter read file hash
    function saveSmartMeterRead(
        uint _assetId,
        uint _newMeterRead,
        string calldata _lastSmartMeterReadFileHash,
        uint _timestamp
    ) external;

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
    ) external returns (uint _assetId);

    function getSmartMeterReadsForAsset(uint _assetId) external view returns (AssetStructs.SmartMeterRead[] memory);

    /// @notice Gets an asset
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @return Full informations of an asset
    function getAssetById(uint _assetId) public view returns (AssetStructs.Asset memory);

    /// @notice gets an asset by its smartmeter
	/// @param _smartMeter smartmeter used for by the asset
	/// @return Asset-Struct
    function getAssetBySmartMeter(address _smartMeter) public view returns (AssetStructs.Asset memory);

    /// @notice checks whether an assets with the provided smartmeter already exists
	/// @param _smartMeter smart meter address of an asset
	/// @return whether there is already an asset with that smartmeter
    function checkAssetExist(address _smartMeter) public view returns (bool);

	/// @notice gets the owner-address of an asset
	/// @param _assetId the id of an asset
	/// @return the owner of that asset
    function getAssetOwner(uint _assetId) external view returns (address);

	/// @notice gets the last meterreading and its hash
	/// @param _assetId the id of an asset
	/// @return the last meterreading and its hash
    function getLastMeterReadingAndHash(uint _assetId)
        external view
        returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash);

    /// @notice function to get the amount of already onboarded assets
    /// @return the amount of assets already deployed
    function getAssetListLength() external view returns (uint);

    /// @notice gets the corresponding UserLogic contract
    /// @return address of the UserLogic contract
    function getUserLogicContract() external view returns (address);
}
