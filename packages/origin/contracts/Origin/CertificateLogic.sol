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
import "@energyweb/asset-registry/contracts/Asset/AssetProducingDB.sol";

import "../../contracts/Origin/CertificateDB.sol";
import "../../contracts/Origin/TradableEntityContract.sol";
import "../../contracts/Origin/TradableEntityLogic.sol";
import "../../contracts/Interfaces/OriginContractLookupInterface.sol";
import "../../contracts/Interfaces/CertificateInterface.sol";
import "../../contracts/Interfaces/TradableEntityDBInterface.sol";

import "../../contracts/Origin/CertificateSpecificDB.sol";
import "../../contracts/Origin/CertificateSpecificContract.sol";

contract CertificateLogic is CertificateInterface, CertificateSpecificContract, TradableEntityContract {
    /// @notice Logs the creation of an event
    event LogCreatedCertificate(uint indexed _certificateId, uint energy, address owner);
    event LogCertificateRetired(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

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

    function buyCertificateInternal(uint _certificateId, address buyer) internal {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);

        require(buyer != cert.tradableEntity.owner, "Can't buy your own certificates.");
        require(cert.tradableEntity.forSale == true, "Unable to buy a certificate that is not for sale.");
        require(cert.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active), "You can only buy Active certificates.");

        bool isOnChainSettlement = cert.tradableEntity.acceptedToken != address(0x0);

        if (isOnChainSettlement) {
            require(
                ERC20Interface(cert.tradableEntity.acceptedToken).transferFrom(
                    buyer, cert.tradableEntity.owner, cert.tradableEntity.onChainDirectPurchasePrice
                ),
                "erc20 transfer failed"
            );
        } else {
            //  TO-DO: Implement off-chain settlement checks
            //  For now automatically transfer the certificate
            //  if it's an off chain settlement
        }

        TradableEntityDBInterface(address(db)).addApprovalExternal(_certificateId, buyer);

        simpleTransferInternal(cert.tradableEntity.owner, buyer, _certificateId);
        checktransferOwnerInternally(_certificateId, cert);

        unpublishForSale(_certificateId);
    }

    /// @notice buys a certificate
    /// @param _certificateId the id of the certificate
    function buyCertificate(uint _certificateId)
        external
        onlyRole(RoleManagement.Role.Trader)
     {
        buyCertificateInternal(_certificateId, msg.sender);
    }

    /// @notice buys a certificate for owner
    /// @param _certificateId the id of the certificate
    /// @param _newOwner the address of the new owner
    function buyCertificateFor(uint _certificateId, address _newOwner)
        public
        onlyRole(RoleManagement.Role.Matcher)
        userHasRole(RoleManagement.Role.Trader, _newOwner)
        {
            buyCertificateInternal(_certificateId, _newOwner);
        }

    /// @notice buys a set of certificates
    /// @param _idArray the ids of the certificates to be bought
    function buyCertificateBulk(uint[] calldata _idArray) external {
        for (uint i = 0; i < _idArray.length; i++) {
            buyCertificateInternal(_idArray[i], msg.sender);
        }
    }

    /// @notice claims a set of certificates
    /// @param _idArray the ids of the certificates to be claimed
    function claimCertificateBulk(uint[] calldata _idArray) external {
        require(_idArray.length <= 100, "maximum number of certificates to claim in one bulk tx is 100");
        for (uint i = 0; i < _idArray.length; i++) {
            retireCertificateInternal(_idArray[i], msg.sender);
        }
    }

    /// @notice Request a certificate to retire. Only Certificate owner can retire
    /// @param _certificateId The id of the certificate
    function retireCertificate(
        uint _certificateId
    )
        external
    {
        retireCertificateInternal(_certificateId, msg.sender);
    }

    function retireCertificateInternal(uint _certificateId, address claimer) internal {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);
        require(cert.tradableEntity.owner == claimer, "You have to be the owner of the contract.");
        require(
            cert.certificateSpecific.children.length == 0,
            "Unable to retire certificates that have already been split."
        );
        
        require(cert.certificateSpecific.status != uint(CertificateSpecificContract.Status.Retired), "cannot claim a certificate that has already been claimed");
        
        CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Retired);
        emit LogCertificateRetired(_certificateId);
    }

    function splitAndBuyCertificate(uint _certificateId, uint _energy)
        external
        onlyRole(RoleManagement.Role.Trader)
    {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);

        require(_energy > 0 && _energy <= cert.tradableEntity.energy, "Energy has to be higher than 0 and lower or equal than certificate energy");

        if (_energy == cert.tradableEntity.energy) {
            buyCertificateInternal(_certificateId, msg.sender);
        } else {
            require(cert.tradableEntity.forSale == true, "Unable to split and buy a certificate that is not for sale.");

            (uint childOneId, uint childTwoId) = splitCertificateInternal(_certificateId, _energy);

            TradableEntityDBInterface(address(db)).setOnChainDirectPurchasePrice(childOneId, cert.tradableEntity.onChainDirectPurchasePrice);
            TradableEntityDBInterface(address(db)).setTradableToken(childOneId, cert.tradableEntity.acceptedToken);

            TradableEntityDBInterface(address(db)).setOnChainDirectPurchasePrice(childTwoId, cert.tradableEntity.onChainDirectPurchasePrice);
            TradableEntityDBInterface(address(db)).setTradableToken(childTwoId, cert.tradableEntity.acceptedToken);

            emit LogPublishForSale(childOneId, cert.tradableEntity.onChainDirectPurchasePrice, cert.tradableEntity.acceptedToken);
            emit LogPublishForSale(childTwoId, cert.tradableEntity.onChainDirectPurchasePrice, cert.tradableEntity.acceptedToken);

            buyCertificateInternal(childOneId, msg.sender);
        }
    }

    /// @notice creates a new Entity / certificate
    /// @param _assetId the id of the producing asset
    /// @param _energy the energy that has been produced
    function createTradableEntity(
        uint _assetId,
        uint _energy
    )
        internal
        returns (uint)
    {
        return createCertificate(_assetId, _energy);
    }

    /// @notice Splits a certificate into two smaller ones, where (total - _energy = 2ndCertificate)
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in Wh for the 1st certificate
    function splitCertificate(uint _certificateId, uint _energy) external {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);
        require(
            msg.sender == cert.tradableEntity.owner || isRole(RoleManagement.Role.Matcher, msg.sender),
            "You are not the owner of the certificate"
        );

        splitCertificateInternal(_certificateId, _energy);
    }

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress) external {
        CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);
        require(
            msg.sender == cert.tradableEntity.owner || isRole(RoleManagement.Role.Matcher, msg.sender),
            "You are not the owner of the certificate"
        );

        (uint childOneId, ) = splitCertificateInternal(_certificateId, _energy);

        TradableEntityDBInterface(address(db)).setOnChainDirectPurchasePrice(childOneId, _price);
        TradableEntityDBInterface(address(db)).setTradableToken(childOneId, _tokenAddress);
        TradableEntityDBInterface(address(db)).setForSale(childOneId, true);

        emit LogPublishForSale(childOneId, _price, _tokenAddress);
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

    /// @notice Splits a certificate into two smaller ones, where (total - _energy = 2ndCertificate)
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    function splitCertificateInternal(uint _certificateId, uint _energy) internal returns (uint childOneId, uint childTwoId) {
        CertificateDB.Certificate memory parent = CertificateDB(address(db)).getCertificate(_certificateId);

        require(parent.tradableEntity.energy > _energy, "The certificate doesn't have enough energy to be split.");
        require(
            parent.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active),
            "Unable to split certificate. You can only split Active certificates."
        );
        require(
            parent.certificateSpecific.children.length == 0,
            "This certificate has already been split."
        );

        (uint childIdOne, uint childIdTwo) = CertificateDB(address(db)).createChildCertificate(_certificateId, _energy);
        emit Transfer(address(0), parent.tradableEntity.owner, childIdOne);
        emit Transfer(address(0), parent.tradableEntity.owner, childIdTwo);

        CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Split);
        emit LogCertificateSplit(_certificateId, childIdOne, childIdTwo);

        return (childIdOne, childIdTwo);
    }

	/// @notice Retires a certificate
	/// @param _certificateId The id of the requested certificate
    function retireCertificateAuto(uint _certificateId) internal {
        CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Retired);
        emit LogCertificateRetired(_certificateId);
    }

    /// @notice Creates a certificate of origin. Checks in the AssetRegistry if requested wh are available.
    /// @param _assetId The id of the asset that generated the energy for the certificate
    /// @param _energy The amount of Wh the Certificate holds
    function createCertificate(uint _assetId, uint _energy)
        internal
        returns (uint)
    {
        AssetProducingDB.Asset memory asset =  AssetProducingInterface(address(assetContractLookup.assetProducingRegistry())).getAssetById(_assetId);

        uint certId = CertificateDB(address(db)).createCertificateRaw(_assetId, _energy, asset.assetGeneral.owner, asset.assetGeneral.lastSmartMeterReadFileHash, asset.maxOwnerChanges);
        emit Transfer(address(0),  asset.assetGeneral.owner, certId);

        emit LogCreatedCertificate(certId, _energy, asset.assetGeneral.owner);
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

        if(_certificate.certificateSpecific.maxOwnerChanges <= ownerChangeCounter){
            CertificateSpecificDB(address(db)).setStatus(_certificateId, CertificateSpecificContract.Status.Retired);
            emit LogCertificateRetired(_certificateId);
        }
    }
}
