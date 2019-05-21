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
import "ew-utils-general-lib/contracts/Msc/Owned.sol";
import "../../contracts/Origin/TradableEntityDB.sol";

contract EnergyDB is TradableEntityDB, TradableEntityContract {

    struct Energy {
        TradableEntity tradableEntity;
    }

    modifier onlyOwnerOrSelf {
        require(msg.sender == owner || msg.sender == address(this),"not the contract itself or the owner");
        _;
    }

    /// @notice An array containing all created certificates
    Energy[] private energyList;
  //  mapping(address => uint) private tokenAmountMapping;
  //  mapping(address => mapping (address => bool)) ownerToOperators;

    /// @notice Constructor
    /// @param _energyLogic The address of the corresbonding logic contract
    constructor(address _energyLogic) TradableEntityDB(_energyLogic) public { }

    /**
        external functions
    */

    /// @notice Adds a new escrow address to an existing certificate
    /// @param _entityId the entity-id
    /// @param _escrow The new escrow-address
    function addEscrowForAsset(uint _entityId, address _escrow) external onlyOwner {
        energyList[_entityId].tradableEntity.escrow.push(_escrow);
    }

    /*
    /// @ntoice
    function setOwnerToOperators(address _company, address _escrow, bool _allowed) external onlyOwner {
        ownerToOperators[_company][_escrow] = _allowed;
    }
    */

    /// @notice creates a new TradableEntity-entry
    /// @param _assetId the asset-id that produced the energy
    /// @param _owner the asset-owner (= the new entity-owner)
    /// @param _powerInW the amount of energy produced
    /// @param _acceptedToken the accepted ERC20-Token
    /// @param _onChainDirectPurchasePrice the price set onchain for direct purchase (using an ERC20 contract)
    function createTradableEntityEntry(
        uint _assetId,
        address _owner,
        uint _powerInW,
        address _acceptedToken,
        uint _onChainDirectPurchasePrice
    )
        external
        onlyOwner
        returns (uint _entityId)
    {

        TradableEntity memory te = TradableEntity({
            assetId: _assetId,
            owner: _owner,
            powerInW: _powerInW,
            acceptedToken: _acceptedToken,
            onChainDirectPurchasePrice: _onChainDirectPurchasePrice,
            escrow: new address[](0),
            approvedAddress: address(0x0)
        });
        energyList.push(Energy({tradableEntity: te}));
        _entityId = energyList.length>0?energyList.length-1:0;
        tokenAmountMapping[_owner]++;
    }

    /// @notice sets a new array of escrowsfor an entity
    /// @param _entityId the id of the entity
    /// @param _escrow the array with escrows
    function setEscrow(uint _entityId, address[] calldata _escrow) external onlyOwner {
        energyList[_entityId].tradableEntity.escrow = _escrow;
    }

    /// @notice sets the owner of a TradableEntity and adds an address for approval
    /// @param _entityId the id of the entity
    /// @param _owner the new owner
    /// @param _approve the address that has the approval to move the token
    function setTradableEntityOwnerAndAddApproval(
        uint _entityId,
        address _owner,
        address _approve
    )
        external
        onlyOwner
    {
        setTradableEntityOwner(_entityId, _owner);
        addApproval(_entityId, _approve);
    }

    /// @notice sets the tradable ERC20-token
    /// @param _entityId the id of the entity
    /// @param _token address of the erc20-token
    function setTradableToken(
        uint _entityId,
        address _token
    )
        external
        onlyOwner
    {
        energyList[_entityId].tradableEntity.acceptedToken = _token;
    }

    /// @notice sets the onchain price (as erc20 token) for direct purchasement
    /// @param _entityId the id of the entity
    /// @param _price the price for a direct onchain purchasement
    function setOnChainDirectPurchasePrice(
        uint _entityId,
        uint _price
    )
        external
        onlyOwner
    {
        energyList[_entityId].tradableEntity.onChainDirectPurchasePrice = _price;
    }

    /// @notice gets the approved-address of an entity
    /// @param _entityId the id of the entity
    /// @return approved address of an entity
    function getApproved(uint256 _entityId) onlyOwner external view returns (address){
        return energyList[_entityId].tradableEntity.approvedAddress;
    }

    /// @notice gets the amount of bundles the address posseses
    /// @param _owner the owner
    /// @return the amount of bundles the provided address owns
    function getBalanceOf(address _owner) external onlyOwner view returns (uint){
        return tokenAmountMapping[_owner];
    }

    /// @notice gets thes tradable (accepted) token for an entity
    /// @param _entityId the id of the entity
    /// @return ERC20-token address
    function getTradableToken(uint _entityId) external onlyOwner view returns (address){
        return energyList[_entityId].tradableEntity.acceptedToken;
    }

    /// @notice gets the ERC20 price for an entity
    /// @param _entityId the id of the entity
    /// @return the ERC20 price for an entity
    function getOnChainDirectPurchasePrice(uint _entityId) external onlyOwner view returns (uint){
        return energyList[_entityId].tradableEntity.onChainDirectPurchasePrice;
    }

    /// @notice gets the owner of a tradableEntity
    /// @param _entityId the id of an entity
    /// @return the owner of a tradableEntity
    function getTradableEntityOwner(uint _entityId)
        external
        onlyOwner
        view
        returns (address)
    {
        return energyList[_entityId].tradableEntity.owner;
    }

    /*
    /// @notice gets whether the provided address is an operator (escrow) for the company
    function getOwnerToOperators(address _company, address _escrow) onlyOwner external view returns (bool){
        return ownerToOperators[_company][_escrow];
    }
    */

    /**
        public functions
     */

    /// @notice sets the Tradable-Entity struct
    /// @param _entityId the id of the entity
    /// @param _entity the new entity
    function setTradableEntity(
        uint _entityId,
        TradableEntityContract.TradableEntity memory _entity
    )
        public
        onlyOwnerOrSelf
    {
        energyList[_entityId].tradableEntity = _entity;
    }

    /// @notice gets the tradableEntity as memory
    /// @dev has to be implemetned to create bytecode
    /// @param _entityId the id of the entity
    /// @return the tradableEntity struct as memory
    function getTradableEntity(uint _entityId) public onlyOwner view returns (TradableEntityContract.TradableEntity memory _entity){
        return energyList[_entityId].tradableEntity;
    }

    /**
        internal functions
     */

    /// @notice sets the tradable entity owner
    /// @param _entityId the id of the entity
    /// @param _owner the new owner
    function setTradableEntityOwner(uint _entityId, address _owner) internal {

        assert(tokenAmountMapping[energyList[_entityId].tradableEntity.owner]>0);
        tokenAmountMapping[energyList[_entityId].tradableEntity.owner]--;
        energyList[_entityId].tradableEntity.owner = _owner;
        tokenAmountMapping[energyList[_entityId].tradableEntity.owner]++;

    }

    /// @notice adds an approved address to an entity
    /// @param _entityId the id of the entity
    /// @param _approve the approved address
    function addApproval(uint _entityId, address _approve) internal {
        energyList[_entityId].tradableEntity.approvedAddress = _approve;
    }

    /// @notice gets the tradableEntity-struct as storage
    /// @dev function has to be implemented to create bytecode
    /// @param _entityId the id of the entity
    /// @return tradableEntity-struct as storage
    function getTradableEntityInternally(
        uint _entityId
    )
        internal
        view
        returns (TradableEntityContract.TradableEntity storage _entity)
    {
        require(msg.sender == owner || msg.sender == address(this));
        return energyList[_entityId].tradableEntity;
    }
}
