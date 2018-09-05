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

/// @title this interface defines functions for defining functions of the user-logic in order to call them in different contracts
interface RolesInterface {
   
    /// @notice function to retrieve the rights of an user
    /// @dev if the user does not exist in the mapping it will return 0x0 thus preventing them from accidently getting any rights
    /// @param _user user someone wants to know its rights
    /// @return bitmask with the rights of the user
    function getRolesRights(address _user) external view returns (uint);

    /// @notice function that checks if there is an user for the provided ethereum-address
    /// @param _user ethereum-address of that user
    /// @return bool if the user exists
    function doesUserExist(address _user) external  view returns (bool);
}