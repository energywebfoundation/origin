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
// @authors: slock.it GmbH, Martin Kuechler, martin.kuchler@slock.it

pragma solidity ^0.4.24;

import "./Msc/Owned.sol";
import "./Interfaces/Updatable.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract AssetContractLookup is Owned {

    Updatable public assetConsumingRegistry;
    Updatable public assetProducingRegistry;
    address public userRegistry;



    /// @notice The constructor 
    constructor() Owned(msg.sender) public{ } 

    /// @notice function to initialize the contracts, setting the needed contract-addresses
    /// @param _userRegistry user-registry logic contract address
    /// @param _assetProducingRegistry asset-registry logic contract address
    /// @param _certificateRegistry certificate-registry logic contract address
    function init(address _userRegistry, Updatable _assetProducingRegistry, Updatable _assetConsumingRegistry) 
        external
        onlyOwner
    {
        require(    
            _userRegistry != 0 && _assetProducingRegistry != address(0) && _assetConsumingRegistry != address(0)
            && userRegistry == 0 && assetProducingRegistry == address(0) && assetConsumingRegistry == address(0),
            "alreadny initialized"
        );
        userRegistry = _userRegistry;
        assetProducingRegistry = _assetProducingRegistry;
        assetConsumingRegistry = _assetConsumingRegistry;
    }

    /// @notice function to update one or more logic-contracts
    /// @param _userRegistry address of the new user-registry-logic-contract
    /// @param _assetProducingRegistry address of the new asset-registry-logic-contract
    /// @param _certificateRegistry address of the new certificate-registry-logic-contract
    function update(
        Updatable _assetProducingRegistry, 
        Updatable _assetConsumingRegistry,
    )
        external
        onlyOwner 
        
    {

        if (_assetProducingRegistry != address(0)) {
            assetProducingRegistry.update(_assetProducingRegistry);
            assetProducingRegistry = _assetProducingRegistry;
        }

        if(_assetConsumingRegistry != address(0)) {
            assetConsumingRegistry.update(_assetConsumingRegistry);
            assetConsumingRegistry = _assetConsumingRegistry;
        }        
        
    }
}