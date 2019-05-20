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
pragma experimental ABIEncoderV2;

import "../../contracts/Users/UserDB.sol";
import "../../contracts/Users/RoleManagement.sol";
import "ew-utils-general-lib/contracts/Interfaces/Updatable.sol";
import "../../contracts/Interfaces/RolesInterface.sol";
import "../../contracts/Interfaces/UserContractLookupInterface.sol";


/// @title The logic-contract for the user-data
/// @notice this contract will not directly store any data, instead it will store them into the userDB-contract
contract UserLogic is RoleManagement, Updatable, RolesInterface {

    /// @notice db user-db for storing the contract
    UserDB public db;

    /// @notice constructor
    /// @dev it will also call the RoleManagement-constructor
    constructor(UserContractLookupInterface _userContractLookup) RoleManagement(_userContractLookup, address(_userContractLookup)) public {}

    /// @notice function to deactive an use, only executable for user-admins
    /// @param _user the user that should be deactivated
    function deactivateUser(address _user)
        external
        onlyRole(RoleManagement.Role.UserAdmin)
    {
        require(
            !isRole(RoleManagement.Role.UserAdmin,_user)
            && !isRole(RoleManagement.Role.AssetAdmin,_user)
            ,"user has an admin role at the moment"
        );

        db.setUserActive(_user, false);
    }

    /// @notice Initialises the contract by binding it to a logic contract
    /// @dev can only be called by the owner (UserContractLookup-Contract)
    /// @param _database Sets the logic contract
    function init(address _database, address _admin)
        external
        onlyOwner
    {
        require(address(db) == address(0x0), "db already initialized");
        db = UserDB(_database);
        db.setRoles(_admin, 2**uint(RoleManagement.Role.UserAdmin));
    }

    /// @notice funciton that can be called to create a new user in the storage-contract, only executable for user-admins!
    /// @notice if the user does not exists yet it will be creates, otherwise the older userdata will be overwritten
    /// @param _user address of the user
    /// @param _organization organization the user is representing
    function setUser(
        address _user,
        string calldata _organization
    )
        external
        onlyRole(RoleManagement.Role.UserAdmin)
    {
        bytes memory orgBytes = bytes(_organization);
        require(orgBytes.length>0, "empty string");
        db.setUser(_user, _organization);
    }

    /// @notice function to set / edit the rights of an user / account, only executable for Top-Admins!
    /// @param _user user that rights will change
    /// @param _rights rights encoded as bitmask
    function setRoles(address _user, uint _rights)
        external
        onlyRole(RoleManagement.Role.UserAdmin)
        userExists(_user)
    {
        db.setRoles(_user, _rights);
    }

    /// @notice function to update the logic of a smart contract
    /// @param _newLogic contract-address of the new smart contract, replacing the currently active one
    function update(address _newLogic)
        external
        onlyOwner
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
            string memory _organization,
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
