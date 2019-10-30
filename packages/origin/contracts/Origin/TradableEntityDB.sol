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

import "@energyweb/utils-general/contracts/Msc/Owned.sol";
import "../../contracts/Interfaces/TradableEntityDBInterface.sol";
import "../../contracts/Origin/TradableEntityContract.sol";

contract TradableEntityDB is Owned,TradableEntityDBInterface {

    /// @notice mapping the amount of tokens per address
    mapping(address => uint) internal tokenAmountMapping;

    /// @notice mapping owner to operators (whether an owner has the right to transfer entities of an owner)
    mapping(address => mapping (address => bool)) internal ownerToOperators;

    /// @notice Constructor
    /// @param _certificateLogic The address of the corresbonding logic contract
    constructor(address _certificateLogic) Owned(_certificateLogic) public { }

    /**
        abstract function declarations
     */
    function getTradableEntity(uint _entityId) public view returns (TradableEntityContract.TradableEntity memory _entity);
    function getTradableEntityInternally(uint _entityId) internal view returns (TradableEntityContract.TradableEntity storage _entity);
    function setTradableEntity(uint _entityId, TradableEntityContract.TradableEntity memory _entity) public;

    /**
        external functions
     */

    /// @notice adds approval for an entity (external call)
    /// @param _entityId the id of the entity
    /// @param _approve the address to be approved
    function addApprovalExternal(
        uint _entityId,
        address _approve
    )
        external
        onlyOwner
    {
        addApproval(_entityId, _approve);
    }

    /// @notice set the flag whether an escrow is allowed to transfer entites of a company
    /// @param _company the owner of certificates
    /// @param _escrow the escrow / matcher
    /// @param _allowed flag whether the escrow is allowed to transfer entities of a company
    function setOwnerToOperators(
        address _company,
        address _escrow,
        bool _allowed
    )
        external
        onlyOwner
    {
        ownerToOperators[_company][_escrow] = _allowed;
    }

    /// @notice sets the tradableOwner, gets called externally
    /// @param _entityId the entity-id
    /// @param _owner the new owner of the entity
    function setTradableEntityOwnerExternal(
        uint _entityId,
        address _owner
    )
        external
        onlyOwner
    {
        setTradableEntityOwner(_entityId, _owner);
    }

    /// @notice gets the approved address for an entity
    /// @param _entityId the id of an entity
    /// @return the approved address of an entity
    function getApproved(uint256 _entityId) external onlyOwner view returns (address) {
        return getTradableEntity(_entityId).approvedAddress;
    }

    /// @notice gets the balance of tokens for an address
    /// @param _owner the owner of tokens
    /// @return the balane of the owner
    function getBalanceOf(address _owner)
        external
        onlyOwner
        view
        returns (uint)
    {
        return tokenAmountMapping[_owner];
    }

    /// @notice returns whether the provided address is allowed to transfer certificates for a company
    /// @param _company address owning tokens
    /// @param _escrow the escrow / matcher
    /// @return whether the escrow is allowed to transfer certificates for a company
    function getOwnerToOperators(
        address _company,
        address _escrow
    )
        external
        onlyOwner
        view
        returns (bool)
    {
        return ownerToOperators[_company][_escrow];
    }

    /// @notice gets the owner of a tradableEntity
    /// @param _entityId the entity-id
    /// @return the owner of a tradable entity
    function getTradableEntityOwner(uint _entityId) external onlyOwner view returns (address){
        return getTradableEntity(_entityId).owner;
    }

    /// @notice sets the TradableEntityOwner and adds approval
    /// @param _entityId the id of an entity
    /// @param _owner the new owner of an entity
    /// @param _approve the approved address for an entity
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

    /**
        internal functions
     */

    /// @notice apprives an address for an entity
    /// @param _entityId the if of an entity
    /// @param _approve the address to be approved
    function addApproval(uint _entityId, address _approve) internal {
        TradableEntityContract.TradableEntity storage te = getTradableEntityInternally(_entityId);
        te.approvedAddress = _approve;
    }

    /// @notice changes the balances of token when a token gets transfered
    /// @param _old owner of an entity before transfer
    /// @param _new owner of an entity after the transfer
    function changeCertOwner(address _old, address _new) internal {
        require(tokenAmountMapping[_old] > 0, "Token amount is 0.");
        tokenAmountMapping[_old]--;
        tokenAmountMapping[_new]++;
    }

    /// @notice Sets the owner of an entity
    /// @param _entityId The array position in which the entity is stored
    /// @param _owner The address of the new owner
    function setTradableEntityOwner(uint _entityId, address _owner) internal {
        TradableEntityContract.TradableEntity storage te = getTradableEntityInternally(_entityId);
        address oldOwner = te.owner;
        te.owner = _owner;
        changeCertOwner(oldOwner,_owner);
    }
}
