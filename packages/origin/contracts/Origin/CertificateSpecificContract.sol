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
import "@energyweb/user-registry/contracts/Users/RoleManagement.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetProducingInterface.sol";
import "@energyweb/asset-registry/contracts/Asset/AssetProducingDB.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetContractLookupInterface.sol";
import "../../contracts/Origin/TradableEntityLogic.sol";


pragma experimental ABIEncoderV2;

contract CertificateSpecificContract is TradableEntityLogic {
    /// @notice constructor
    /// @param _assetContractLookup the asset-RegistryContractLookup-Address
    /// @param _originContractLookup the origin-RegistryContractLookup-Address
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        OriginContractLookupInterface _originContractLookup
    )
    TradableEntityLogic(_assetContractLookup, _originContractLookup) public { }

    enum CertificationRequestStatus {
        Pending,
        Approved
    }

    struct CertificationRequest {
        uint assetId;
        uint readsStartIndex;
        uint readsEndIndex;
        CertificationRequestStatus status;
    }

    struct CertificateSpecific {
        uint status;
        string dataLog;
        uint creationTime;
        uint parentId;
        uint[] children;
        uint maxOwnerChanges;
        uint ownerChangeCounter;
    }

    enum Status {
        Active,
        Retired,
        Split
    }

    mapping(uint => uint) internal assetRequestedCertsForSMReadsLength;

    CertificationRequest[] public certificationRequests;

    function createTradableEntity(
        uint _assetId,
        uint energy
    )
        internal
        returns (uint);

    function getCertificationRequestsLength() public view returns (uint) {
        return certificationRequests.length;
    }

    function getAssetRequestedCertsForSMReadsLength(uint _assetId) public view returns (uint) {
        return assetRequestedCertsForSMReadsLength[_assetId];
    }

    function setAssetRequestedCertsForSMReadsLength(uint _assetId, uint readsLength)
        internal
    {
        assetRequestedCertsForSMReadsLength[_assetId] = readsLength;
    }

    function requestCertificates(uint _assetId, uint lastRequestedSMReadIndex)
        public
    {
        AssetProducingInterface assetRegistry = AssetProducingInterface(address(assetContractLookup.assetProducingRegistry()));

        AssetProducingDB.Asset memory asset = assetRegistry.getAssetById(_assetId);

        require(asset.assetGeneral.owner == msg.sender, "msg.sender must be asset owner");

        AssetProducingDB.SmartMeterRead[] memory reads = assetRegistry.getSmartMeterReadsForAsset(_assetId);

        require(lastRequestedSMReadIndex < reads.length, "lastRequestedSMReadIndex should be lower than smart meter reads length");

        uint start = 0;
        uint requestedSMReadsLength = getAssetRequestedCertsForSMReadsLength(_assetId);

        if (requestedSMReadsLength > start) {
            start = requestedSMReadsLength;
        }

        require(lastRequestedSMReadIndex >= start, "lastRequestedSMReadIndex has to be higher or equal to start index");

        certificationRequests.push(CertificationRequest(
            _assetId,
            start,
            lastRequestedSMReadIndex,
            CertificationRequestStatus.Pending
        ));

        setAssetRequestedCertsForSMReadsLength(_assetId, lastRequestedSMReadIndex + 1);
    }

    function approveCertificationRequest(uint _certicationRequestIndex)
        public
        onlyRole(RoleManagement.Role.Issuer)
    {
        CertificationRequest storage request = certificationRequests[_certicationRequestIndex];
        
        require(request.status == CertificationRequestStatus.Pending, "certification request has to be in pending state");

        AssetProducingInterface assetRegistry = AssetProducingInterface(address(assetContractLookup.assetProducingRegistry()));

        AssetProducingDB.SmartMeterRead[] memory reads = assetRegistry.getSmartMeterReadsForAsset(request.assetId);

        uint energy = 0;
        for (uint i = request.readsStartIndex; i <= request.readsEndIndex; i++)
        {
            energy += reads[i].energy;
        }

        createTradableEntity(request.assetId, energy);

        request.status = CertificationRequestStatus.Approved;
    }
}
