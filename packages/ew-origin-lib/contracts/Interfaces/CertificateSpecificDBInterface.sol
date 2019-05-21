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

interface CertificateSpecificDBInterface {

    /// @notice gets whether the certificate has the retired flag
    /// @param _certificateID the certificate id
    ///@return retired flag
    function getRetired(uint _certificateID) external returns (bool);

    /// @notice sets the retired flag for a certificate
    /// @param _certificateID the certificate id
    /// @param _retired the retired flag
    function setRetired(uint _certificateID, bool _retired) external;


    /// @notice gets the dataLog for a certificate
    /// @param _certificateID the certificate id
    /// @return the dataLog
    function getDataLog(uint _certificateID) external returns (string memory);

    /// @notice sets the datalog for a certificate
    /// @param _certificateID the certificate id
    /// @param _newDataLog new datalog
    function setDataLog(uint _certificateID, string calldata _newDataLog) external;


    /// @notice gets the max owner changes for a certificate
    /// @param _certificateID the certificate id
    /// @return the number of max owner changes
    function getMaxOwnerChanges(uint _certificateID) external returns (uint);

    /// @notice sets the max owner changes for a certificate
    /// @param _certificateID the certificate id
    /// @param _newMaxOwnerChanges the new max owner changes
    function setMaxOwnerChanges(uint _certificateID, uint _newMaxOwnerChanges) external;


    /// @notice gets the counter for owner changes
    /// @param _certificateID the certificate id
    /// @return the counter for owner changes
    function getOwnerChangeCounter(uint _certificateID) external returns (uint);

    /// @notice sets the counter for owner changes
    /// @param _certificateID the certificate id
    /// @param _newOwnerChangeCounter new counter for owner changes
    function setOwnerChangeCounter(uint _certificateID, uint _newOwnerChangeCounter) external;


    /// @notice gets the amount of children for a certificate
    /// @param _certificateID the certificate id
    /// @return returns the amount of children of a certificate
    function getCertificateChildrenLength(uint _certificateID) external view returns (uint);

    /// @notice add Children
	/// @param _certificateId the certificate Id
	/// @param _childId the child Id
    function addChildrenExternal(uint _certificateId, uint _childId) external;
}
