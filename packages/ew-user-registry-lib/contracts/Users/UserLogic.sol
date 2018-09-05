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
// @authors: slock.it GmbH, Martin Kuechler, martin.kuechler@slock.it

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../Users/UserDB.sol";
import "./RoleManagement.sol";
import "../UserContractLookup.sol";
import "../Interfaces/Updatable.sol";
import "../Interfaces/RolesInterface.sol";

/// @title The logic-contract for the user-data
/// @notice this contract will not directly store any data, instead it will store them into the userDB-contract
contract UserLogic is RoleManagement, Updatable, RolesInterface {

    UserContractLookup public userContractLookup;

    /// @notice db user-db for storing the contract
    UserDB public db;

    modifier isInitialized {
        require(address(db) != 0x0);
        _;
    }

    /// @notice constructor 
    /// @param _coo address of the Certificate Registry contract (CoO.sol)
    /// @dev it will also call the RoleManagement-constructor 
    constructor(UserContractLookup _userContractLookup) RoleManagement() Owned(msg.sender) public {

    }


    /// @notice function to deactive an use, only executable for user-admins
    /// @param _user the user that should be deactivated
    function deactivateUser(address _user)
        external
        onlyRole(RoleManagement.Role.UserAdmin)
        isInitialized
    {
        require(
            !isRole(RoleManagement.Role.TopAdmin,_user) 
            && !isRole(RoleManagement.Role.UserAdmin,_user) 
            && !isRole(RoleManagement.Role.AssetAdmin,_user)
            && !isRole(RoleManagement.Role.AgreementAdmin,_user)
        );

        db.setUserActive(_user, false);
    }

    /// @notice Initialises the contract by binding it to a logic contract
    /// @param _database Sets the logic contract
    function init(address _database) external onlyOwner {
        require(db == UserDB(0x0), "db already initialized");
        db = UserDB(_database);
        db.setRoles(msg.sender, RoleManagement.TopAdmin);
    }

    /// @notice funciton that can be called to create a new user in the storage-contract, only executable for user-admins!
    /// @notice if the user does not exists yet it will be creates, otherwise the older userdata will be overwritten
    /// @param _user address of the user
    /// @param _organization organization the user is representing
    function setUser(        
        address _user, 
        string _organization
    ) 
        external 
        onlyRole(RoleManagement.Role.UserAdmin) 
        isInitialized
    {   
        bytes memory orgBytes = bytes(_organization);
        require(orgBytes.length>0, "empty string");
        db.setUser(_user, _organization);
    }
    
    /// @notice function to set / edit the rights of an user / account, only executable for Top-Admins!
    /// @param _user user that rights will change
    /// beware: if the only TopAdmin revokes its own rights noone will be able to get TopAdmin-rights back, making it impossible to set any new admin-rights
    /// @param _rights rights encoded as bitmask
    function setRoles(address _user, uint _rights) 
        external 
        onlyRole(RoleManagement.Role.UserAdmin)
        isInitialized
        userExists(_user)
    {
        db.setRoles(_user, _rights);
    }

    /// @notice function to update the logic of a smart contract
    /// @param _newLogic contract-address of the new smart contract, replacing the currently active one
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
        isInitialized
    {
        db.changeOwner(_newLogic);
    }

    /// @notice function that checks if there is an user for the provided ethereum-address
    /// @param _user ethereum-address of that user
    /// @return bool if the user exists
    function doesUserExist(address _user) 
        external 
        view 
        returns (bool) 
    {
        return db.getFullUser(_user).active;
    }

    /// @notice function to return all the data of an user
    /// @param _user user 
    /// @return returns firstName, surname, organization, street, number, zip, city, country, state, roles and the active-flag
    function getFullUser(address _user)
        external
        view 
        returns (
            string _organization,
            uint _roles,
            bool _active
        )
    {
        UserDB.User memory user = db.getFullUser(_user);
        _organization = user.organization;
        _roles = user.roles;
        _active = user.active;
    }

    /// @notice function to retrieve the rights of an user
    /// @dev if the user does not exist in the mapping it will return 0x0 thus preventing them from accidently getting any rights
    /// @param _user user someone wants to know its rights
    /// @return bitmask with the rights of the user
    function getRolesRights(address _user) 
        external 
        view 
        returns (uint) 
    {
        return db.getFullUser(_user).roles;
    }
}