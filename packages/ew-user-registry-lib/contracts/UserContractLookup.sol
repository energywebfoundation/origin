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

pragma solidity ^0.5.0;

import "ew-utils-general-lib/contracts/Msc/Owned.sol";
import "ew-utils-general-lib/contracts/Interfaces/Updatable.sol";
import "../contracts/Interfaces/UserContractLookupInterface.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract UserContractLookup is Owned, UserContractLookupInterface {

    Updatable private userRegistryContract;

    /// @notice The constructor
    constructor() Owned(msg.sender) public{ }

    /// @notice function to initialize the contracts, setting the needed contract-addresses
    /// @param _userRegistry user-registry logic contract address
    /// @param _db the database-contract of the user-registry-system
    function init(Updatable _userRegistry, address _db)
        external
        onlyOwner
    {
        require(address(_userRegistry) != address(0) && address(userRegistryContract) == address(0), "already initialized");
        require(address(_db) != address(0x0), "_db cannot be 0");
        userRegistryContract = _userRegistry;
        userRegistryContract.init(_db, msg.sender);
    }

    /// @notice function to update one or more logic-contracts
    /// @param _userRegistry address of the new user-registry-logic-contract
    function update(
        Updatable _userRegistry
    )
        external
        onlyOwner
    {
        require(address(_userRegistry)!= address(0x0), "update: cannot set to 0");
        userRegistryContract.update(address(_userRegistry));
        userRegistryContract = _userRegistry;
    }

    /// @notice returns the current userRegistryLogic that has access to the db
    /// @dev this function will be called by external contracts
    /// @return the user-Registry
    function userRegistry() external view returns (address){
        return address(userRegistryContract);
    }
}
