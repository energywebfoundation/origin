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

import "ew-utils-general-lib/contracts/Msc/Owned.sol";
import "ew-utils-general-lib/contracts/Interfaces/Updatable.sol";
import "ew-user-registry-lib/contracts/Interfaces/UserContractLookupInterface.sol";
import "../contracts/Interfaces/MarketContractLookupInterface.sol";
import "ew-asset-registry-lib/contracts/Interfaces/AssetContractLookupInterface.sol";

/// @title Contract for storing the current logic-lib-addresses for the certificate of origin
contract MarketContractLookup is Owned, MarketContractLookupInterface {

    Updatable private marketLogicRegistryContracts;
    AssetContractLookupInterface public assetContractLookupContract;

    /// @notice The constructor
    constructor() Owned(msg.sender) public{ }

	/// @notice function to initialize the contracts, setting the needed contract-addresses
	/// @param _assetRegistry the asset Registry
	/// @param _marketLogicRegistry the market Logic Registry
	/// @param _marketDB the market D B
    function init(
        AssetContractLookupInterface _assetRegistry,
        Updatable _marketLogicRegistry,
        address _marketDB
    )
        external
        onlyOwner
    {
        require(
            address(_assetRegistry) != address(0x0)
            && address(_marketLogicRegistry) != address(0x0)
            && address(marketLogicRegistryContracts) == address(0x0)
            && address(assetContractLookupContract) == address(0x0),
            "already initialized"
        );
        require(address(_marketDB) != address(0x0), "marketDB cannot be 0");

        marketLogicRegistryContracts = _marketLogicRegistry;
        assetContractLookupContract = _assetRegistry;

        marketLogicRegistryContracts.init(_marketDB, msg.sender);
    }


	/// @notice function to update one or more logic-lib
	/// @param _marketRegistry address of the new user-registry-logic-contract
    function update(
        Updatable _marketRegistry
    )
        external
        onlyOwner
    {
        require(address(_marketRegistry) != address(0x0), "update: cannot set to 0");
        marketLogicRegistryContracts.update(address(_marketRegistry));
        marketLogicRegistryContracts = _marketRegistry;
    }

	/// @notice marketlogic registry
	/// @return the marketlogic-registry
    function marketLogicRegistry() external view returns (address){
        return address(marketLogicRegistryContracts);
    }

	/// @notice asset contract lookup
	/// @return the assetregistry
    function assetContractLookup() external view returns (address){
        return address(assetContractLookupContract);
    }

}