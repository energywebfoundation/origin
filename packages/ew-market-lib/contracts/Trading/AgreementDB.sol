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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "ew-utils-general-lib/contracts/Msc/Owned.sol";

contract AgreementDB is Owned {

    struct Agreement {
        string propertiesDocumentHash;
        string documentDBURL;
        string matcherPropertiesDocumentHash;
        string matcherDBURL;
        uint demandId;
        uint supplyId;
        bool approvedBySupplyOwner;
        bool approvedByDemandOwner;
        address[] allowedMatcher;
    }

    /// @notice list with all created agreements
    Agreement[] private allAgreements;


	/// @notice approves an demand for an agreement
	/// @param _agreementId the agreement Id
	/// @return true when both supply and demand agreed
    function approveAgreementDemandDB(uint _agreementId)
        onlyOwner
        external
        returns (bool)
    {
        Agreement storage a = allAgreements[_agreementId];
        a.approvedByDemandOwner = true;
        return (a.approvedByDemandOwner && a.approvedBySupplyOwner);
    }

	/// @notice approves an supply for an agreement
	/// @param _agreementId the agreement Id
	/// @return true when both supply and demand agreed
    function approveAgreementSupplyDB(uint _agreementId)
        onlyOwner
        external
        returns (bool)
    {
        Agreement storage a = allAgreements[_agreementId];
        a.approvedBySupplyOwner = true;
        return (a.approvedByDemandOwner && a.approvedBySupplyOwner);
    }

	/// @notice function to create a agreement
	/// @param _propertiesDocumentHash document-hash with all the properties of the agreement
	/// @param _documentDBURL url-address of the agreement
	/// @param _demandId the demand Id
	/// @param _supplyId the supply Id
	/// @return the index and thus the identifier of a agreement
    function createAgreementDB
    (
        string calldata _propertiesDocumentHash,
        string calldata _documentDBURL,
        string calldata _matcherPropertiesDocumentHash,
        string calldata _matcherDBURL,
        uint _demandId,
        uint _supplyId
   )
        external
        onlyOwner
        returns (uint _agreementId)
    {

        address[] memory emptyMatcher = new address[](0);
        allAgreements.push(Agreement({
            propertiesDocumentHash: _propertiesDocumentHash,
            documentDBURL: _documentDBURL,
            matcherPropertiesDocumentHash: _matcherPropertiesDocumentHash,
            matcherDBURL: _matcherDBURL,
            demandId: _demandId,
            supplyId: _supplyId,
            approvedBySupplyOwner: false,
            approvedByDemandOwner: false,
            allowedMatcher: emptyMatcher
        }));
        _agreementId = allAgreements.length>0?allAgreements.length-1:0;

    }

    /// @notice set the matchers for an agreement
    /// @param _agreementId id of an agreement
    /// @param _matchers matcher-array 
    function setAgreementMatcher(
        uint _agreementId,
        address[] calldata _matchers
    )
        external 
        onlyOwner
    {
        Agreement storage a = allAgreements[_agreementId];
        a.allowedMatcher = _matchers;
    }

    /// @notice sets the matcherProperties for an agreement
    /// @param _agreementId id of an agreement
    /// @param _matcherPropertiesDocumentHash document-hash of the matcher properties
    /// @param _matcherDBURL db-url of the document-hash
    function setMatcherPropertiesAndURL(
        uint _agreementId,
        string calldata _matcherPropertiesDocumentHash,
        string calldata _matcherDBURL
    )
        external 
        onlyOwner
    {
        Agreement storage a = allAgreements[_agreementId];
        a.matcherPropertiesDocumentHash = _matcherPropertiesDocumentHash;
        a.matcherDBURL = _matcherDBURL;
    }

	/// @notice Returns a agreement-struct
	/// @param _agreementId id of a agreement
	/// @return returns a agreement-struct
    function getAgreementDB(uint _agreementId)
        external
        view
        onlyOwner
        returns (Agreement memory)
    {
        return allAgreements[_agreementId];
    }

	/// @notice funtion to retrieve the length of the allagreements-array
	/// @return the length of the allagreements-array
    function getAllAgreementListLengthDB()
        external
        view
        onlyOwner
        returns (uint)
    {
        return allAgreements.length;
    }
}
