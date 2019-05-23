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

import "../../contracts/Interfaces/CertificateSpecificDBInterface.sol";
import "../../contracts/Origin/CertificateSpecificContract.sol";

import "ew-utils-general-lib/contracts/Msc/Owned.sol";

contract CertificateSpecificDB is CertificateSpecificDBInterface, Owned {

    /**
        abstract function declarations
     */
    function getCertificateSpecific(uint _certificateId) external view returns (CertificateSpecificContract.CertificateSpecific memory _certificate);
    function getCertificateInternally(uint _certificateId) internal view returns (CertificateSpecificContract.CertificateSpecific  storage _certificate);
    function setCertificateSpecific(uint _certificateId, CertificateSpecificContract.CertificateSpecific memory _certificate) public;

    /**
        external functions
     */

    /// @notice sets the datalog (lastSmartMeterReadFileHash) of a certificate
    /// @param _certificateId the id of a certificate
    /// @param _newDataLog the new datalog
    function setDataLog(
        uint _certificateId,
        string calldata _newDataLog
    )
        external
        onlyOwner
    {
        CertificateSpecificContract.CertificateSpecific storage certificate = getCertificateInternally(_certificateId);
        certificate.dataLog = _newDataLog;
    }

    /// @notice sets the max owner changes for a certificate
    /// @param _certificateId the id of the certificate
    /// @param _newMaxOwnerChanges the new amount of max owner changes
    function setMaxOwnerChanges(uint _certificateId, uint _newMaxOwnerChanges) external onlyOwner {
        CertificateSpecificContract.CertificateSpecific storage certificate = getCertificateInternally(_certificateId);
        certificate.maxOwnerChanges = _newMaxOwnerChanges;
    }

    /// @notice sets the owner change counter
    /// @param _certificateId the id of the certificate
    /// @param _newOwnerChangeCounter the new counter
    function setOwnerChangeCounter(uint _certificateId, uint _newOwnerChangeCounter) external {
        require(msg.sender == owner || msg.sender == address(this), "You are not the owner.");
        CertificateSpecificContract.CertificateSpecific storage certificate = getCertificateInternally(_certificateId);
        certificate.ownerChangeCounter = _newOwnerChangeCounter;
    }

    /// @notice sets the status to Split for a certificate
    /// @param _certificateId the id of the certificate
    function setStatus(uint _certificateId, CertificateSpecificContract.Status status) external onlyOwner {
        CertificateSpecificContract.CertificateSpecific storage certificate = getCertificateInternally(_certificateId);
        if (certificate.status != uint(status)) {
            certificate.status = uint(status);
        }
    }

    /// @notice returns the number of children of a certificate
    /// @param _certificateId the certificate-id
    /// @return the number of children of a certificate
    function getCertificateChildrenLength(uint _certificateId)
        external
        onlyOwner
        view
        returns (uint)
    {
        return getCertificateInternally(_certificateId).children.length;
    }


    /// @notice gets the datalog (lastSmartMeterReadFileHash) of a certificate
    /// @param _certificateId the id of a certificate
    /// @return datalog
    function getDataLog(uint _certificateId) external onlyOwner returns (string memory){
        return getCertificateInternally(_certificateId).dataLog;
    }

    /// @notice gets the maximum owner changes of a certificate
    /// @param _certificateId the id of a certificate
    /// @return the maximum owner changes
    function getMaxOwnerChanges(uint _certificateId) external onlyOwner returns (uint){
        return getCertificateInternally(_certificateId).maxOwnerChanges;
    }

    /// @notice returns the owner change counter
    /// @param _certificateId the of a certificate
    /// @return owner change counter
    function getOwnerChangeCounter(uint _certificateId) external onlyOwner returns (uint){
        return getCertificateInternally(_certificateId).ownerChangeCounter;
    }

    /// @notice gets the flag whether the certificate is retired
    /// @param _certificateId the id of a certificate
    /// @return flag whether a certificate is retired
    function isRetired(uint _certificateId) external onlyOwner returns (bool) {
        return getCertificateInternally(_certificateId).status == uint(CertificateSpecificContract.Status.Retired);
    }

    /**
        public functions
     */

    /// @notice adds a children to a certificate
    /// @param _certificateId the id of a certificate
    /// @param _childId the id of the child
    function addChildrenExternal(uint _certificateId, uint _childId) public onlyOwner {
        addChildren(_certificateId, _childId);
    }

	/// @notice Adds a certificate-Id as child to an existing certificate
	/// @param _certificateId The array position in which the parent certificate is stored
	/// @param _childId The array position in which the child certificate is stored
    function addChildren(uint _certificateId, uint _childId) public onlyOwner {
        getCertificateInternally(_certificateId).children.push(_childId);
    }

}
