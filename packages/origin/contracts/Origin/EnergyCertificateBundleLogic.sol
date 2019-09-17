// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

/// @title The logic contract for the Certificate of Origin list
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid CertificateDB(db) contract to function correctly

import "@energyweb/erc-test-contracts/contracts/Interfaces/ERC20Interface.sol";
import "@energyweb/user-registry/contracts/Users/RoleManagement.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetProducingInterface.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetContractLookupInterface.sol";

import "../../contracts/Origin/CertificateDB.sol";
import "../../contracts/Origin/TradableEntityContract.sol";
import "../../contracts/Origin/TradableEntityLogic.sol";
import "../../contracts/Origin/EnergyCertificateBundleDB.sol";
import "../../contracts/Interfaces/OriginContractLookupInterface.sol";
import "../../contracts/Interfaces/EnergyCertificateBundleInterface.sol";
import "../../contracts/Origin/CertificateSpecificContract.sol";

contract EnergyCertificateBundleLogic is TradableEntityContract, CertificateSpecificContract {

    /// @notice Logs the creation of an event
    event LogCreatedBundle(uint indexed _bundleId, uint powerInW, address owner);
    /// @notice Logs the request of an retirement of a bundle
    event LogBundleRetired(uint indexed _bundleId);
    /// @notice Logs when the ownership of a bundle has changed
    event LogBundleOwnerChanged(uint indexed _bundleId, address _oldOwner, address _newOwner, address _oldEscrow);
    /// @notice Logs when an escrow for a bunlde gets removed
    event LogEscrowRemoved(uint indexed _bundleId, address _escrow);
    /// @notice Logs when an escrow for a bundle gets added
    event LogEscrowAdded(uint indexed _bundleId, address _escrow);

    /// @notice constructor
    /// @param _assetContractLookup the asset-RegistryContractLookup-Address
    /// @param _originContractLookup the origin-RegistryContractLookup-Address
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        OriginContractLookupInterface _originContractLookup
    )
    CertificateSpecificContract(_assetContractLookup, _originContractLookup) public { }

    /**
        ERC721 functions to overwrite
     */

    /// @notice safeTransferFrom function (see ERC721 definition)
    /// @param _from sender/owner of the certificate
    /// @param _to receiver / new owner of the certificate
    /// @param _entityId the certificate-id
    /// @param _data calldata to be passed
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _entityId,
        bytes calldata _data
    )
        external
        onlyRole(RoleManagement.Role.Trader)
        payable
    {
        internalSafeTransfer(_from, _to, _entityId, _data);
    }

    /// @notice safeTransferFrom function (see ERC721 definition)
    /// @param _from sender/owner of the certificate
    /// @param _to receiver / new owner of the certificate
    /// @param _entityId the certificate-id
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _entityId
    )
        external
        onlyRole(RoleManagement.Role.Trader)
        payable
    {
        bytes memory data = "";
        internalSafeTransfer(_from, _to, _entityId, data);
    }

    /// @notice simple transfer function
    /// @param _from sender/owner of the certificate
    /// @param _to receiver / new owner of the certificate
    /// @param _entityId the certificate-id
    function transferFrom(
        address _from,
        address _to,
        uint256 _entityId
    )
        external
        payable
    {
        EnergyCertificateBundleDB.EnergyCertificateBundle memory bundle = EnergyCertificateBundleDB(address(db)).getBundle(_entityId);
        simpleTransferInternal(_from, _to, _entityId);
        emit LogBundleOwnerChanged(_entityId, bundle.tradableEntity.owner, _to, address(0x0));
        checktransferOwnerInternally(_entityId, bundle);
    }

    /**
        external functions
    */
    /// @notice adds a new escrow address to a bundle
    /// @param _bundleId The id of the bundle
    /// @param _escrow The additional escrow address
    function addEscrowForAsset(uint _bundleId, address _escrow)
        external
    {
        EnergyCertificateBundleDB.EnergyCertificateBundle memory bundle = EnergyCertificateBundleDB(address(db)).getBundle(_bundleId);
        require(bundle.tradableEntity.owner == msg.sender, "You are not the owner of the bundle.");
        require(
            bundle.tradableEntity.escrow.length < OriginContractLookupInterface(owner).maxMatcherPerCertificate(),
            "Already has a maximum number of escrows."
        );
        TradableEntityDBInterface(address(db)).addEscrowForEntity(_bundleId, _escrow);
        emit LogEscrowAdded(_bundleId, _escrow);
    }

    /// @notice creates a new bundle
    /// @param _assetId the id of the producing asset
    /// @param _powerInW the power that has been produced
    function createTradableEntity(
        uint _assetId,
        uint _powerInW
    )
        internal
        returns (uint)
    {
        return createBundle(_assetId, _powerInW);
    }

    /// @notice Request a bundle to retire. Only bundle owner can retire
    /// @param _bundleId The id of the bundle
    function retireBundle(uint _bundleId) external {
        EnergyCertificateBundleDB.EnergyCertificateBundle memory bundle = EnergyCertificateBundleDB(address(db)).getBundle(_bundleId);
        require(bundle.tradableEntity.owner == msg.sender, "You are not the owner of the bundle.");
        require(bundle.certificateSpecific.children.length == 0, "Bundles with children cannot be retired.");
        require(
            bundle.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active),
            "Can only retire Active certificates"
        );
        retireBundleAuto(_bundleId);
    }

    /// @notice Removes an escrow-address of a bundle
    /// @param _bundleId The id of the bundle
    /// @param _escrow The address to be removed
    function removeEscrow(uint _bundleId, address _escrow) external {
        require(
            EnergyCertificateBundleDB(address(db)).getBundle(_bundleId).tradableEntity.owner == msg.sender,
            "You are not the owner of the bundle."
        );
        require(
            EnergyCertificateBundleDB(address(db)).removeEscrow(_bundleId, _escrow),
            "Unable to remove escrow."
        );
        emit LogEscrowRemoved(_bundleId, _escrow);
    }

    /// @notice gets the EnergyCertificateBundle as memory
    /// @param _bundleId the id of the bundle
    /// @return the EnergyCertificateBundle as memory
    function getBundle(uint _bundleId)
        external
        view
        returns (EnergyCertificateBundleDB.EnergyCertificateBundle memory)
    {
        return EnergyCertificateBundleDB(address(db)).getBundle(_bundleId);
    }

    /// @notice Getter for the length of the list of bundles
    /// @return the length of the array (= the amount of existing bundles)
    function getBundleListLength() external view returns (uint) {
        return EnergyCertificateBundleDB(address(db)).getBundleListLength();
    }

    /// @notice Gets the owner of a bundle
    /// @param _bundleId The id of the requested bundle
    /// @return the bundle owner
    function getBundleOwner(uint _bundleId) external view returns (address) {
        return EnergyCertificateBundleDB(address(db)).getBundle(_bundleId).tradableEntity.owner;
    }

    /// @notice gets the retired flag of a bundle
    /// @param _bundleId The id of the requested bundle
    /// @return the retired flag
    function isRetired(uint _bundleId) external view returns (bool) {
        return EnergyCertificateBundleDB(address(db))
            .getBundle(_bundleId)
            .certificateSpecific.status == uint(CertificateSpecificContract.Status.Retired);
    }

    /**
        internal functions
    */

    /// @notice Creates a bundle. Checks in the AssetRegistry if requested wh are available.
    /// @param _assetId The id of the asset that generated the energy for the bundle
    /// @param _powerInW The amount of Watts the bundle holds
    /// @return the id of the new bundle
    function createBundle(uint _assetId, uint _powerInW)
        internal
        returns (uint)
    {
        AssetProducingDB.Asset memory asset = AssetProducingInterface(address(assetContractLookup.assetProducingRegistry()))
            .getAssetById(_assetId);

        TradableEntityContract.TradableEntity memory tradableEntity = TradableEntityContract.TradableEntity({
            assetId: _assetId,
            owner: asset.assetGeneral.owner,
            powerInW: _powerInW,
            forSale: false,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0,
            escrow: asset.assetGeneral.matcher,
            approvedAddress: address(0x0)
        });

        CertificateSpecific memory certificateSpecific = CertificateSpecific({
            status: uint(CertificateSpecificContract.Status.Active),
            dataLog: asset.assetGeneral.lastSmartMeterReadFileHash,
            creationTime: block.timestamp,
            parentId: EnergyCertificateBundleDB(address(db)).getBundleListLength(),
            children: new uint256[](0),
            maxOwnerChanges: asset.maxOwnerChanges,
            ownerChangeCounter: 0
        });

        uint bundleId = EnergyCertificateBundleDB(address(db)).createEnergyCertificateBundle(
            tradableEntity,
            certificateSpecific
        );

        emit Transfer(address(0),  asset.assetGeneral.owner, bundleId);

        emit LogCreatedBundle(bundleId, _powerInW, asset.assetGeneral.owner);
        return bundleId;

    }

    /// @notice automatically retires a bundle
    /// @param _bundleId The id of the requested bundle
    function retireBundleAuto(uint _bundleId) internal{
        db.setTradableEntityEscrowExternal(_bundleId, new address[](0));
        EnergyCertificateBundleDB(address(db)).setStatus(_bundleId, CertificateSpecificContract.Status.Retired);
        emit LogBundleRetired(_bundleId);
    }

    /// @notice calls the safe-transfer checks
    /// @param _from sender/owner of the certificate
    /// @param _to receiver / new owner of the certificate
    /// @param _entityId the certificate-id
    /// @param _data calldata to be passed
    function internalSafeTransfer(
        address _from,
        address _to,
        uint256 _entityId,
        bytes memory _data
    )
        internal
    {
        EnergyCertificateBundleDB.EnergyCertificateBundle memory bundle = EnergyCertificateBundleDB(address(db)).getBundle(_entityId);

        simpleTransferInternal(_from, _to, _entityId);
        safeTransferChecks(_from, _to, _entityId, _data);
        emit LogBundleOwnerChanged(_entityId, bundle.tradableEntity.owner, _to, address(0x0));
        checktransferOwnerInternally(_entityId, bundle);
    }

    /// @notice Transfers the ownership, checks if the requirements are met
    /// @param _bundleId The id of the requested bundle
    /// @param _bundle The bundle where the ownership should be transfered
    function checktransferOwnerInternally(
        uint _bundleId,
        EnergyCertificateBundleDB.EnergyCertificateBundle memory _bundle
    )
        internal
    {
        require(_bundle.certificateSpecific.children.length == 0, "Bundles with children cannot be transferred.");
        require(
            _bundle.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active),
            "Bundle has to be active to be transferred."
        );
        require(
            _bundle.certificateSpecific.ownerChangeCounter < _bundle.certificateSpecific.maxOwnerChanges,
            "Bundle has already changed too many owners."
        );
        uint ownerChangeCounter = _bundle.certificateSpecific.ownerChangeCounter + 1;

        EnergyCertificateBundleDB(address(db)).setOwnerChangeCounter(_bundleId, ownerChangeCounter);
        db.setTradableEntityEscrowExternal(_bundleId, new address[](0));

        if(_bundle.certificateSpecific.maxOwnerChanges <= ownerChangeCounter){
         //   EnergyCertificateBundleDB(db).setBundleEscrow(_bundleId, empty);
            EnergyCertificateBundleDB(address(db)).setStatus(_bundleId, CertificateSpecificContract.Status.Retired);
            emit LogBundleRetired(_bundleId);
        }
    }
}
