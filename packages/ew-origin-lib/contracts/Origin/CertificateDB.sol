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

pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

/// @title The Database contract for the Certificate of Origin list
/// @notice This contract only provides getter and setter methods

import "../../contracts/Origin/TradableEntityContract.sol";
import "../../contracts/Origin/TradableEntityDB.sol";
import "../../contracts/Origin/CertificateSpecificContract.sol";
import "../../contracts/Origin/CertificateSpecificDB.sol";

contract CertificateDB is TradableEntityDB, CertificateSpecificDB {

    struct Certificate {
        TradableEntityContract.TradableEntity tradableEntity;
        CertificateSpecificContract.CertificateSpecific certificateSpecific;
    }

    modifier onlyOwnerOrSelf {
        require(msg.sender == owner || msg.sender == address(this), "not the contract itself or the owner");
        _;
    }

    /// @notice An array containing all created certificates
    Certificate[] private certificateList;

    /// @notice Constructor
    /// @param _certificateLogic The address of the corresbonding logic contract
    constructor(address _certificateLogic) TradableEntityDB(_certificateLogic) public { }

    /**
        external functions
    */
    /// @notice sets the counter of owner changes and resets all escrows
    /// @dev should be called whenever a certificate gets transfered
    /// @param _certificateId array-position of the certificate
    /// @param _newCounter new counter of owner changes
    function setOwnerChangeCounterResetEscrow(
        uint _certificateId,
        uint _newCounter
    )
        external
        onlyOwnerOrSelf
    {
        this.setOwnerChangeCounter(_certificateId, _newCounter);
        setTradableEntityEscrow(_certificateId, new address[](0));
    }

    /// @notice gets the certificate-specific struct of a certificate
    /// @param _certificateId the id of the certificate
    /// @return certificate-specific struct as memory
    function getCertificateSpecific(uint _certificateId)
        external
        onlyOwnerOrSelf
        view
        returns (CertificateSpecificContract.CertificateSpecific memory _certificate)
    {
        require(msg.sender == owner || msg.sender == address(this), "Unauthorized to get this certificate.");
        return certificateList[_certificateId].certificateSpecific;
    }

    /**
        public functions
    */

    /// @notice creates a certificate with the provided parameters
    /// @param _assetId the asset-id that produced energy thus created the certificate
    /// @param _powerInW the power in wh
    /// @param _escrow array with escrow-addresses
    /// @param _assetOwner the assetOwner -> owner of the new certificate
    /// @param _lastSmartMeterReadFileHash the filehash of the last meterreading
    /// @param _maxOwnerChanges the maximal amount of owner changes
    function createCertificateRaw(
        uint _assetId,
        uint _powerInW,
        address[] memory _escrow,
        address _assetOwner,
        string memory _lastSmartMeterReadFileHash,
        uint _maxOwnerChanges
    )
        public
        onlyOwner
        returns (uint _certId)
    {
        TradableEntityContract.TradableEntity memory tradableEntity = TradableEntityContract.TradableEntity({
            assetId: _assetId,
            owner: _assetOwner,
            powerInW: _powerInW,
            forSale: false,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0,
            escrow: _escrow,
           // escrow: new address[](0),
            approvedAddress: address(0x0)

        });


        CertificateSpecificContract.CertificateSpecific memory certificateSpecific = CertificateSpecificContract.CertificateSpecific({
            status: uint(CertificateSpecificContract.Status.Active),
            dataLog: _lastSmartMeterReadFileHash,
            creationTime: block.timestamp,
            parentId: getCertificateListLength(),
            children: new uint256[](0),
            maxOwnerChanges: _maxOwnerChanges,
            ownerChangeCounter: 0
        });


        _certId = createCertificate(
            tradableEntity,
            certificateSpecific
        );
    }

    /// @notice Creates 2 new children certificates
    /// @param _parentId the id of the parent certificate
    /// @param _power the power that should be splitted
    /// @return The ids of the certificate
    function createChildCertificate(
        uint _parentId,
        uint _power
    )
        public
        onlyOwner
        returns
        (uint _childIdOne, uint _childIdTwo)
    {
        Certificate memory parent = certificateList[_parentId];

        TradableEntityContract.TradableEntity memory childOneEntity = TradableEntityContract.TradableEntity({
            assetId: parent.tradableEntity.assetId,
            owner: parent.tradableEntity.owner,
            powerInW: _power,
            forSale: parent.tradableEntity.forSale,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0,
            escrow: parent.tradableEntity.escrow,
            approvedAddress: parent.tradableEntity.approvedAddress
        });

        CertificateSpecificContract.CertificateSpecific memory certificateSpecificOne = CertificateSpecificContract.CertificateSpecific({
            status: uint(CertificateSpecificContract.Status.Active),
            dataLog: parent.certificateSpecific.dataLog,
            creationTime: parent.certificateSpecific.creationTime,
            parentId: _parentId,
            children: new uint256[](0),
            maxOwnerChanges: parent.certificateSpecific.maxOwnerChanges,
            ownerChangeCounter: parent.certificateSpecific.ownerChangeCounter
        });

        _childIdOne = createCertificate(
            childOneEntity,
            certificateSpecificOne
        );

        TradableEntityContract.TradableEntity memory childTwoEntity = TradableEntityContract.TradableEntity({
            assetId: parent.tradableEntity.assetId,
            owner: parent.tradableEntity.owner,
            powerInW: parent.tradableEntity.powerInW - _power,
            forSale: parent.tradableEntity.forSale,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0,
            escrow: parent.tradableEntity.escrow,
            approvedAddress: parent.tradableEntity.approvedAddress
        });

        CertificateSpecificContract.CertificateSpecific memory certificateSpecificTwo = CertificateSpecificContract.CertificateSpecific({
            status: uint(CertificateSpecificContract.Status.Active),
            dataLog: parent.certificateSpecific.dataLog,
            creationTime: parent.certificateSpecific.creationTime,
            parentId: _parentId,
            children: new uint256[](0),
            maxOwnerChanges: parent.certificateSpecific.maxOwnerChanges,
            ownerChangeCounter: parent.certificateSpecific.ownerChangeCounter
        });

        _childIdTwo = createCertificate(
            childTwoEntity,
            certificateSpecificTwo
        );
        addChildren(_parentId, _childIdOne);
        addChildren(_parentId, _childIdTwo);

    }

    /// @notice Returns the certificate that corresponds to the given array id
    /// @param _certificateId The array position in which the certificate is stored
    /// @return Certificate as struct
    function getCertificate(uint _certificateId)
        public
        onlyOwner
        view
        returns (Certificate memory)
    {
        return certificateList[_certificateId];
    }

    /// @notice function to get the amount of all certificates
    /// @return the amount of all certificates
    function getCertificateListLength() public onlyOwner view returns (uint) {
        return certificateList.length;
    }

    /// @notice gets the TradableEntity struct
    /// @dev has to be implemented to create bytecode
    /// @param _entityId the id of the entity/certificate
    /// @return TradableEntity struct as memory
    function getTradableEntity(
        uint _entityId
    )
        public
        onlyOwnerOrSelf
        view
        returns (TradableEntityContract.TradableEntity memory)
    {
        return certificateList[_entityId].tradableEntity;
    }

    /// @notice sets the TradableEntity of an entity
    /// @dev has to be implemented to create bytecode
    /// @param _entityId the if of the entity/certificate
    /// @param _entity the new entity
    function setTradableEntity(
        uint _entityId,
        TradableEntityContract.TradableEntity memory _entity
    )
        public
        onlyOwnerOrSelf
    {
        certificateList[_entityId].tradableEntity = _entity;
    }

    /// @notice sets the certificate-specific struct of a certificate
    /// @param _certificateId the id of the certificate
    /// @param _certificate the new certificate-specific struct
    function setCertificateSpecific(
        uint _certificateId,
        CertificateSpecificContract.CertificateSpecific memory _certificate
    )
        public
        onlyOwnerOrSelf
    {
        certificateList[_certificateId].certificateSpecific = _certificate;
    }

    /**
        internal functions
     */
    /// @notice Creates a new certificate
    /// @param _tradableEntity The tradeable entity specific properties
    /// @param _certificateSpecific The certificate specific properties
    /// @return The id of the certificate
    function createCertificate(
        TradableEntityContract.TradableEntity memory _tradableEntity,
        CertificateSpecificContract.CertificateSpecific memory _certificateSpecific
    )
        internal
        returns
        (uint _certId)
    {
        _certId = certificateList.push(
            Certificate(
                _tradableEntity,
                _certificateSpecific
            )
        ) - 1;
        tokenAmountMapping[_tradableEntity.owner]++;
    }

    /// @notice gets the certificate-speciic struct of an certificate as storage
    /// @param _certificateId the id of the certificate
    /// @return the certificate-specific struct as as storage
    function getCertificateInternally(
        uint _certificateId
    )
        internal
        view
        returns (CertificateSpecificContract.CertificateSpecific storage _certificate)
    {
        return certificateList[_certificateId].certificateSpecific;
    }

    /// @notice get the TradableEntity struct
    /// @dev has to be implemented to create bytecode
    /// @param _entityId the id of the entity/certificate
    /// @return TradableEntity struct as storage
    function getTradableEntityInternally(
        uint _entityId
    )
        internal
        view
        returns (TradableEntityContract.TradableEntity storage _entity)
    {
        return certificateList[_entityId].tradableEntity;
    }
}
