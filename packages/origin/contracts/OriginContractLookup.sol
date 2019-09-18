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

import "@energyweb/utils-general/contracts/Msc/Owned.sol";
import "@energyweb/utils-general/contracts/Interfaces/Updatable.sol";
import "@energyweb/user-registry/contracts/Interfaces/UserContractLookupInterface.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetContractLookupInterface.sol";

import "../contracts/Interfaces/OriginContractLookupInterface.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract OriginContractLookup is Owned, OriginContractLookupInterface {
    
    Updatable private originLogicRegistryContract;
    AssetContractLookupInterface private assetContractLookupContract;


    /// @notice The constructor
    constructor() Owned(msg.sender) public {}

	/// @notice function to initialize the contracts, setting the needed contract-addresses
	/// @param _assetRegistry the asset Registry
	/// @param _originLogicRegistry the origin Logic Registry
	/// @param _originDB the origin DB
    function init(
        AssetContractLookupInterface _assetRegistry,
        Updatable _originLogicRegistry,
        address _originDB
    )
        external
        onlyOwner
    {
        require(
            address(_assetRegistry) != address(0)
            && address(_originLogicRegistry) != address(0)
            && address(originLogicRegistryContract) == address(0)
            && address(assetContractLookupContract) == address(0),
            "already initialized"
        );

        require(_originDB != address(0), "originDB cannot be 0");

        originLogicRegistryContract = _originLogicRegistry;
        assetContractLookupContract = _assetRegistry;

        originLogicRegistryContract.init(_originDB, msg.sender);
    }

	/// @notice function to update one or more logic-contracts
	/// @param _originRegistry address of the new user-registry-logic-contract
    function update(
        Updatable _originRegistry
    )
        external
        onlyOwner
    {
        require(address(_originRegistry)!= address(0), "update: cannot set to 0");
        originLogicRegistryContract.update(address(_originRegistry));
        originLogicRegistryContract = _originRegistry;
    }

	/// @notice gets the origin logic registry
	/// @return the origin logic registry
    function originLogicRegistry() external view returns (address){
        return address(originLogicRegistryContract);
    }

	/// @notice gets the asset contract lookup
	/// @return the asset contract lookup
    function assetContractLookup() external view returns (address){
        return address(assetContractLookupContract);
    }
}
