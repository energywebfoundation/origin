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

import "ew-user-registry-lib/contracts/Users/RoleManagement.sol";
import "../../contracts/Origin/CertificateDB.sol";
import "ew-asset-registry-lib/contracts/Interfaces/AssetProducingInterface.sol";
import "../../contracts/Origin/TradableEntityContract.sol";
import "../../contracts/Origin/TradableEntityLogic.sol";
import "ew-asset-registry-lib/contracts/Interfaces/AssetContractLookupInterface.sol";
import "../../contracts/Interfaces/OriginContractLookupInterface.sol";
import "../../contracts/Interfaces/CertificateInterface.sol";
import "../../contracts/Interfaces/ERC20Interface.sol";
import "../../contracts/Interfaces/TradableEntityDBInterface.sol";
import "ew-asset-registry-lib/contracts/Asset/AssetProducingDB.sol";

import "../../contracts/Origin/CertificateSpecificDB.sol";
import "../../contracts/Origin/CertificateSpecificContract.sol";

contract CertificateLogic is CertificateInterface, RoleManagement, TradableEntityLogic, TradableEntityContract {

    /// @notice Logs the creation of an event
    event LogCreatedCertificate(uint indexed _certificateId, uint powerInW, address owner);
    event LogCertificateRetired(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

    /// @notice constructor
    /// @param _assetContractLookup the asset-RegistryContractLookup-Address
    /// @param _originContractLookup the origin-RegistryContractLookup-Address
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        OriginContractLookupInterface _originContractLookup
    )
    TradableEntityLogic(_assetContractLookup, _originContractLookup)  public { }

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
        onlyRole(RoleManagement.Role.Trader)
        external payable
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
        onlyRole(RoleManagement.Role.Trader)
        external payable
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
        onlyRole(RoleManagement.Role.Trader)
        external
        payable
    {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_entityId);
        simpleTransferInternal(_from, _to, _entityId);
        checktransferOwnerInternally(_entityId, cert);
    }

    /**
        external functions
    */

    /// @notice buys a certificate
    /// @param _certificateId the id of the certificate
    function buyCertificate(uint _certificateId)
        external
        onlyRole(RoleManagement.Role.Trader)
     {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);

        require(cert.tradableEntity.forSale == true, "Unable to buy a certificate that is not for sale.");
        require(cert.tradableEntity.acceptedToken != address(0x0), "0x0 not allowed");
        require(
            ERC20Interface(cert.tradableEntity.acceptedToken).transferFrom(
                msg.sender, cert.tradableEntity.owner, cert.tradableEntity.onChainDirectPurchasePrice
            ),
            "erc20 transfer failed"
        );

        TradableEntityDBInterface(address(db)).addApprovalExternal(_certificateId, msg.sender);

        simpleTransferInternal(cert.tradableEntity.owner, msg.sender, _certificateId);
        checktransferOwnerInternally(_certificateId, cert);

        TradableEntityDBInterface(address(db)).unpublishForSale(_certificateId);
    }

    /// @notice creates a new Entity / certificate
    /// @param _assetId the id of the producing asset
    /// @param _powerInW the generated power in Wh
    function createTradableEntity(uint _assetId, uint _powerInW)
        external
        onlyAccount(address(assetContractLookup.assetProducingRegistry()))
        returns (uint)
    {
        return createCertificate(_assetId, _powerInW);
    }

    /// @notice Request a certificate to retire. Only Certificate owner can retire
    /// @param _certificateId The id of the certificate
    function retireCertificate(
        uint _certificateId
    )
        external
    {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);
        require(cert.tradableEntity.owner == msg.sender, "You have to be the owner of the contract.");
        require(
            cert.certificateSpecific.children.length == 0,
            "Unable to retire certificates that have already been split."
        );

        if (cert.certificateSpecific.status != uint(CertificateSpecificContract.Status.Retired)) {
            retireCertificateAuto(_certificateId);
        }
    }

    /// @notice Splits a certificate into two smaller ones, where (total - _power = 2ndCertificate)
    /// @param _certificateId The id of the certificate
    /// @param _power The amount of power in W for the 1st certificate
    function splitCertificate(uint _certificateId, uint _power) external {
        CertificateDB.Certificate memory parent = CertificateDB(address(db)).getCertificate(_certificateId);
        require(
            msg.sender == parent.tradableEntity.owner || checkMatcher(parent.tradableEntity.escrow),
            "You are not the owner of the certificate"
        );
        require(parent.tradableEntity.powerInW > _power, "The certificate doesn't have enough power to be split.");
        require(
            parent.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active),
            "Unable to split certificate. You can only split Active certificates."
        );
        require(
            parent.certificateSpecific.children.length == 0,
            "This certificate has already been split."
        );

        (uint childIdOne, uint childIdTwo) = CertificateDB(address(db)).createChildCertificate(_certificateId, _power);
        emit Transfer(address(0), parent.tradableEntity.owner, childIdOne);
        emit Transfer(address(0), parent.tradableEntity.owner, childIdTwo);

        CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Split);
        emit LogCertificateSplit(_certificateId, childIdOne, childIdTwo);
    }

    /// @notice gets the certificate
    /// @param _certificateId the certificate-id
    /// @return the certificate-struct as memory
    function getCertificate(uint _certificateId) external view returns (CertificateDB.Certificate memory certificate)
    {
        return CertificateDB(address(db)).getCertificate(_certificateId);
    }

    /// @notice Getter for the length of the list of certificates
    /// @return the length of the array
    function getCertificateListLength() external view returns (uint) {
        return CertificateDB(address(db)).getCertificateListLength();
    }

    /// @notice gets the owner of an certificate
    /// @param _certificateId The id of the requested certificate
    /// @return the owner of a certificate
    function getCertificateOwner(uint _certificateId) external view returns (address) {
        return CertificateDB(address(db)).getCertificate(_certificateId).tradableEntity.owner;
    }

    /// @notice gets whether the certificate is retired
    /// @param _certificateId The id of the requested certificate
    /// @return flag whether the certificate is retired
    function isRetired(uint _certificateId) external view returns (bool) {
        return CertificateDB(address(db))
            .getCertificate(_certificateId)
            .certificateSpecific.status == uint(CertificateSpecificContract.Status.Retired);
    }

    /**
        internal functions
    */
	/// @notice Retires a certificate
	/// @param _certificateId The id of the requested certificate
    function retireCertificateAuto(uint _certificateId) internal {
        db.setTradableEntityEscrowExternal(_certificateId, new address[](0));
        CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Retired);
        emit LogCertificateRetired(_certificateId);
    }

    /// @notice Creates a certificate of origin. Checks in the AssetRegistry if requested wh are available.
    /// @param _assetId The id of the asset that generated the energy for the certificate
    /// @param _powerInW The amount of Watts the Certificate holds
    function createCertificate(uint _assetId, uint _powerInW)
        internal
        returns (uint)
    {
        AssetProducingDB.Asset memory asset =  AssetProducingInterface(address(assetContractLookup.assetProducingRegistry())).getAssetById(_assetId);

        uint certId = CertificateDB(address(db)).createCertificateRaw(_assetId, _powerInW, asset.assetGeneral.matcher, asset.assetGeneral.owner, asset.assetGeneral.lastSmartMeterReadFileHash, asset.maxOwnerChanges);
        emit Transfer(address(0),  asset.assetGeneral.owner, certId);

        emit LogCreatedCertificate(certId, _powerInW, asset.assetGeneral.owner);
        return certId;

    }

    /// @notice calls check-functions before transfering a certificate
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
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_entityId);

        simpleTransferInternal(_from, _to, _entityId);
        safeTransferChecks(_from, _to, _entityId, _data);
        checktransferOwnerInternally(_entityId, cert);
    }

    /// @notice Transfers the ownership, checks if the requirements are met
    /// @param _certificateId The id of the requested certificate
    /// @param _certificate The certificate where the ownership should be transfered
    function checktransferOwnerInternally(
        uint _certificateId,
        CertificateDB.Certificate memory _certificate
    )
        internal
    {
        require(
            _certificate.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active),
            "You can only change owners for active contracts."
        );
        require(_certificate.certificateSpecific.children.length == 0, "This certificates has children and it's owner cannot be changed.");
        require(
            _certificate.certificateSpecific.ownerChangeCounter < _certificate.certificateSpecific.maxOwnerChanges,
            "Maximum number of owner changes is surpassed."
        );
        uint ownerChangeCounter = _certificate.certificateSpecific.ownerChangeCounter + 1;

        CertificateDB(address(db)).setOwnerChangeCounterResetEscrow(_certificateId,ownerChangeCounter);

        if(_certificate.certificateSpecific.maxOwnerChanges <= ownerChangeCounter){
            CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Retired);
            emit LogCertificateRetired(_certificateId);
        }
    }
}
