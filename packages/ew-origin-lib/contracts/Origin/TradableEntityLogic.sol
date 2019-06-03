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
pragma experimental ABIEncoderV2;

import "ew-user-registry-lib/contracts/Users/RoleManagement.sol";
import "ew-utils-general-lib/contracts/Interfaces/Updatable.sol";
import "../../contracts/Origin/TradableEntityContract.sol";
import "../../contracts/Interfaces/ERC721.sol";
import "../../contracts/Interfaces/ERC721TokenReceiver.sol";
import "../../contracts/Interfaces/ERC165.sol";
import "ew-asset-registry-lib/contracts/Interfaces/AssetProducingInterface.sol";
import "../../contracts/Origin/EnergyDB.sol";
import "../../contracts/Interfaces/TradableEntityDBInterface.sol";
import "../../contracts/Interfaces/OriginContractLookupInterface.sol";
import "../../contracts/Interfaces/TradableEntityInterface.sol";
import "ew-asset-registry-lib/contracts/Interfaces/AssetContractLookupInterface.sol";
import "ew-user-registry-lib/contracts/Interfaces/UserContractLookupInterface.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract TradableEntityLogic is Updatable, RoleManagement, ERC721, ERC165, TradableEntityInterface {

    TradableEntityDBInterface public db;
    AssetContractLookupInterface public assetContractLookup;

    /// @notice Logs when a transfer or creation of a tradableEntity occurs
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    /// @notice Logs when an address gets approved
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    /// @notice Logs when an ApprovedForAll gets triggered
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /// @notice Logs when an escrow gets removed
    event LogEscrowRemoved(uint indexed _certificateId, address _escrow);
    /// @notice Logs when an escrow gets added
    event LogEscrowAdded(uint indexed _certificateId, address _escrow);

    modifier onlyEntityOwner(uint _entityId) {
        require(db.getTradableEntityOwner(_entityId) == msg.sender,"not the entity-owner");
        _;
    }

    /// @notice Constructor
    /// @param _assetContractLookup assetContractLookupRegistry-contract address
    /// @param _originContractLookup originContractLookup contract address
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        OriginContractLookupInterface _originContractLookup
    )
        RoleManagement((UserContractLookupInterface((_assetContractLookup.userRegistry()))), address(_originContractLookup))
        public
    {
        assetContractLookup = _assetContractLookup;
    }

    /**
        abstract function
    */
    /// @notice creates a tradable entity
    /// @param _assetId the id of the asset that produced the energy
    /// @param _powerInW the amount of energy produced
    /// @return the id of the newly created entity
    function createTradableEntity(uint _assetId, uint _powerInW) external returns (uint);
    
    /**
        ERC721 functions
     */

    /// @notice gets the balance of an owner
    /// @param _owner the owner
    /// @return the amount of entitys of the owner
    function balanceOf(address _owner) external view returns (uint256){
        require(_owner != address(0x0),"address 0x0 not allowed");
        return db.getBalanceOf(_owner);
    }

    /// @notice returns the owner of an entity
    /// @param _entityId the entity id
    /// @return address of the owner
    function ownerOf(uint256 _entityId) external view returns (address){
        address owner = db.getTradableEntityOwner(_entityId);
        require(owner != address(0x0),"address 0x0 not allowed");
        return owner;
    }

    /// @notice safeTransferFrom function (see ERC721 definition)
    /// @param _from sender/owner of the entity
    /// @param _to receiver / new owner of the entity
    /// @param _entityId the entity-id
    /// @param _data calldata to be passed
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _entityId,
        bytes calldata _data
    )
        external
        payable
    {
        simpleTransferInternal(_from, _to, _entityId);
        safeTransferChecks(_from, _to, _entityId, _data);
    }

    /// @notice safeTransferFrom function (see ERC721 definition)
    /// @param _from sender/owner of the entity
    /// @param _to receiver / new owner of the entity
    /// @param _entityId the entity-id
    function safeTransferFrom(address _from, address _to, uint256 _entityId) external payable {
        bytes memory data = "";
        simpleTransferInternal(_from, _to, _entityId);
        safeTransferChecks(_from, _to, _entityId, data);
    }

    /// @notice simple transfer function
    /// @param _from sender/owner of the entity
    /// @param _to receiver / new owner of the entity
    /// @param _entityId the entity-id
    function transferFrom(address _from, address _to, uint256 _entityId) external payable {
        simpleTransferInternal(_from, _to, _entityId);
    }

    /// @notice approves an address for an entity
    /// @param _approved address to be approved
    /// @param _entityId the entity-id
    function approve(address _approved, uint256 _entityId) external payable {
        TradableEntityContract.TradableEntity memory te = TradableEntityDB(address(db)).getTradableEntity(_entityId);
        require(te.owner == msg.sender || checkMatcher(te.escrow),"approve: not owner / matcher");
        db.addApprovalExternal(_entityId, _approved);

        emit Approval(msg.sender,_approved, _entityId);
    }

    /// @notice Removes an escrow-address of a certifiacte
    /// @param _certificateId The id of the certificate
    /// @param _escrow The address to be removed
    function removeEscrow(uint _certificateId, address _escrow) external onlyEntityOwner(_certificateId){
        require(db.removeEscrow(_certificateId, _escrow),"escrow address not in array");
        emit LogEscrowRemoved(_certificateId, _escrow);
    }

    /// @notice sets approve
    /// @param _escrow the address to be approved for all entities of an owner
    /// @param _approved the approved flag
    function setApprovalForAll(address _escrow, bool _approved) external {
        db.setOwnerToOperators(msg.sender, _escrow, _approved);
        emit ApprovalForAll(msg.sender, _escrow, _approved);
    }

    /// @notice gets the approved account of an entity
    /// @param _tokenId the entity id
    function getApproved(uint _tokenId) external view returns (address) {
        return db.getApproved(_tokenId);
    }

    /// @notice returns whether the operator (escrow) is approved for the company
    /// @param _owner the owner / company
    /// @param _operator the operator / escrow
    /// @return flag whether the operator is approved
    function isApprovedForAll(address _owner, address _operator) external view returns (bool) {
        return db.getOwnerToOperators(_owner, _operator);
    }

     /**
        external non erc721 functions
    */

    /// @notice adds a new escrow address to a certificate
    /// @param _certificateId The id of the certificate
    /// @param _escrow The additional escrow address
    function addEscrowForEntity(uint _certificateId, address _escrow)
        external
        onlyEntityOwner(_certificateId)
    {
        require(
            db.getTradableEntityEscrowLength(_certificateId) < OriginContractLookupInterface(owner).maxMatcherPerCertificate(),
            "maximum amount of escrows reached"
        );
        db.addEscrowForEntity(_certificateId, _escrow);
        emit LogEscrowAdded(_certificateId, _escrow);
    }

    /// @notice initializes the contract by binding it to a logic contract
    /// @param _database Sets the logic contract
    function init(address _database, address _admin) external onlyOwner {
        require(db == TradableEntityDBInterface(0x0), "TradableEntity already initialized.");
        db = TradableEntityDBInterface(_database);
    }

    /// @notice sets the direct purchase price for onchain
    /// @param _entityId the id of the entity
    /// @param _price the on chain direct purchase price
    function setOnChainDirectPurchasePrice(
        uint _entityId,
        uint _price
    )
        onlyEntityOwner(_entityId)
        external
    {
        db.setOnChainDirectPurchasePrice(_entityId, _price);
    }

    /// @notice sets the tradable token (ERC20 contract)
    /// @param _entityId the id of the entity
    /// @param _tokenContract the ERC20 tokenContract
    function setTradableToken(
        uint _entityId,
        address _tokenContract
    )
        onlyEntityOwner(_entityId)
        external
    {
        db.setTradableToken(_entityId, _tokenContract);
    }


    /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic)
        external
        onlyOwner
    {
        Owned(address(db)).changeOwner(_newLogic);
    }


    /// @notice gets the onchain direct purchase price
    /// @param _entityId the id of the entity
    /// @return the number of ERC20 required to buy the entity
    function getOnChainDirectPurchasePrice(uint _entityId) external view returns (uint) {
        return db.getOnChainDirectPurchasePrice(_entityId);
    }


    /// @notice gets the tradableEntity
    /// @param _entityId the id of the entity
    /// @return the tradableEntity
    function getTradableEntity(uint _entityId)
        external
        view
        returns (
            TradableEntityContract.TradableEntity memory
        )
    {
        return TradableEntityDB(address(db)).getTradableEntity(_entityId);
    }

    /// @notice gets the tradable token
    /// @param _entityId the id of an entity
    /// @return the tradable token (ERC20 contract)
    function getTradableToken(uint _entityId) external view returns (address){
        return db.getTradableToken(_entityId);
    }

    /// @notice functions that checks whether this contract supports a certain interfaceId
    /// @param _interfaceID the interfaceId
    /// @return true if interfaceId == 0x80ac58cd
    function supportsInterface(bytes4 _interfaceID) external view returns (bool){
        if(_interfaceID == 0x80ac58cd) return true;
    }

    /**
        public functions
     */
    /// @notice Checks if the msg.sender is included in the matcher-array
    /// @param _matcher the array with matchers
    /// @return true when the msg.sender is in the matcher-array
    function checkMatcher(address[] memory _matcher) public view returns (bool){

        // we iterate through the matcherarray, the length is defined by the maxMatcherPerAsset-parameter of the Coo-contract or the array-length if it's shorter
        for(uint i = 0; i < ( AssetContractLookupInterface(assetContractLookup).maxMatcherPerAsset() < _matcher.length? AssetContractLookupInterface(assetContractLookup).maxMatcherPerAsset():_matcher.length); i++){
            if(_matcher[i] == msg.sender) return true;
        }
    }

    /**
        internal functions
     */
    /// @notice function to check whether the provided address is a contract
    /// @param _address the address to be checked
    /// @return true when the address has some bytecode
    function isContract(address _address) internal view returns (bool) {
        uint size;
        assembly { size := extcodesize(_address) }
        return size > 0;
    }

    /// @notice checks the transfer requirements
    /// @param _from sender/owner of the entity
    /// @param _to receiver / new owner of the entity
    /// @param _entityId the entity-id
    function simpleTransferInternal(
        address _from,
        address _to,
        uint256 _entityId
    )
        internal
    {
        TradableEntityContract.TradableEntity memory te = TradableEntityDB(address(db)).getTradableEntity(_entityId);

        require(te.owner == _from,"not the owner of the entity");
        require(te.owner != address(0x0), "0x0 as owner is not allowed");
        require(msg.value == 0, "sending value is not allowed");
      //  require((te.owner == _from) && (te.owner != 0x0) && (msg.value == 0),"owner not matching or send value");
        require(
            te.owner == msg.sender
            || checkMatcher(te.escrow)
            || db.getOwnerToOperators(te.owner, msg.sender)
            || te.approvedAddress == msg.sender, "simpleTransfer, missing rights"
        );
        db.setTradableEntityOwnerAndAddApproval(_entityId, _to,address(0x0));
        db.removeTokenAndPrice(_entityId);
        emit Transfer(_from,_to,_entityId);
    }

    /// @notice checks requirements for a safe transder
    /// @param _from sender/owner of the entity
    /// @param _to receiver / new owner of the entity
    /// @param _entityId the entity-id
    /// @param _data calldata to be passed
    function safeTransferChecks(
        address _from,
        address _to,
        uint256 _entityId,
        bytes memory _data
    )
        internal
    {
        require(isContract(_to),"_to is not a contract");
        require(ERC721TokenReceiver(_to).onERC721Received(address(this),_from,_entityId,_data) == 0x150b7a02,"_to did not respond correctly");
    }
}
