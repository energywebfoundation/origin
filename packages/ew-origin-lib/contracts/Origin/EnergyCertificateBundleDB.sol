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
import "../../contracts/Origin/CertificateDB.sol";
import "../../contracts/Origin/TradableEntityDB.sol";
import "../../contracts/Origin/CertificateSpecificContract.sol";
import "../../contracts/Origin/CertificateSpecificDB.sol";

contract EnergyCertificateBundleDB is TradableEntityDB, TradableEntityContract, CertificateSpecificDB {

    struct EnergyCertificateBundle {
        TradableEntity tradableEntity;
        CertificateSpecificContract.CertificateSpecific certificateSpecific;
    }

    modifier onlyOwnerOrSelf {
        require(msg.sender == owner || msg.sender == address(this),"not the contract itself or the owner");
        _;
    }

    /// @notice An array containing all created bundles
    EnergyCertificateBundle[] private bundleList;

    /// @notice Constructor
    /// @param _certificateLogic the originContractLookup-address
    constructor(address _certificateLogic) TradableEntityDB(_certificateLogic) public { }

    /**
        external functions
    */

    /// @notice Returns the certificate that corresponds to the given array id
    /// @param _bundleID The array position in which the certificate is stored
    /// @return Certificate as struct
    function getBundle(uint _bundleID)
        external
        onlyOwnerOrSelf
        view
        returns (EnergyCertificateBundle memory)
    {
        return bundleList[_bundleID];
    }

    /// @notice function to get the amount of all bundle
    /// @return the amount of all certificates
    function getBundleListLength() external onlyOwner view returns (uint) {
        return bundleList.length;
    }

	/// @notice get Certificate Specific
	/// @param _certificateId the certificate Id
	/// @return the certificate-specific struct as memory
    function getCertificateSpecific(uint _certificateId)
        external
        onlyOwnerOrSelf
        view
        returns (CertificateSpecificContract.CertificateSpecific memory _certificate)
    {
        return bundleList[_certificateId].certificateSpecific;
    }

    /**
        public functions
    */

    /// @notice Creates a new certificate
    /// @param _tradableEntity The tradeable entity specific properties
    /// @param _certificateSpecific The certificate specific properties
    /// @return The id of the certificate
    function createEnergyCertificateBundle(
        TradableEntity memory _tradableEntity,
        CertificateSpecificContract.CertificateSpecific memory _certificateSpecific
    )
        public
        onlyOwner
        returns
        (uint _certId)
    {
        _certId = bundleList.push(
            EnergyCertificateBundle(
                _tradableEntity,
                _certificateSpecific
            )
        ) - 1;

        tokenAmountMapping[_tradableEntity.owner]++;
    }

    /// @notice sets the certificate-specific struct
    /// @param _certificateId the certificate-id
    /// @param _certificate the new certificate-specific struct
    function setCertificateSpecific(
        uint _certificateId,
        CertificateSpecificContract.CertificateSpecific memory _certificate
    )
        public
        onlyOwnerOrSelf
    {
        bundleList[_certificateId].certificateSpecific = _certificate;
    }

    /// @notice sets the tradableEntity-struct
    /// @dev the funciton has to be implemented to create bytecode
    /// @param _entityId the id of the certificate / entity
    /// @param _entity the new tradableEntitys-struct
    function setTradableEntity(
        uint _entityId,
        TradableEntityContract.TradableEntity memory _entity)
        public
        onlyOwnerOrSelf
    {
        bundleList[_entityId].tradableEntity = _entity;
    }

    /// @notice gets the tradableEntity-struct
    /// @dev function has to be implemented to create bytecode
    /// @param _entityId the certificate/entity-id
    /// @return the TradableEntity struct as memory
    function getTradableEntity(uint _entityId)
        public
        onlyOwnerOrSelf
        view
        returns (TradableEntityContract.TradableEntity memory _entity)
    {
        return bundleList[_entityId].tradableEntity;
    }

    /**
        internal functions
     */

    /// @notice gets the TradableEntity-struct internally
    /// @dev the function has to be implemented to create bytecode
    /// @param _entityId the id of certificate / entity
    /// @return TradableEntity-struct as storage
    function getTradableEntityInternally(uint _entityId) internal view returns (TradableEntityContract.TradableEntity storage _entity) {
        return bundleList[_entityId].tradableEntity;
    }

    /// @notice gets the certificate-specific struct internally
    /// @param _certificateId the certificate-id
    /// @return the certificate-specific struct
    function getCertificateInternally(
        uint _certificateId
    )
        internal
        view
        returns (CertificateSpecificContract.CertificateSpecific  storage _certificate)
    {
        return bundleList[_certificateId].certificateSpecific;
    }


}
