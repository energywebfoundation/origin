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
// @authors: slock.it GmbH, Simon Jentzsch, simon.jentzsch@slock.it

pragma solidity ^0.4.24;

contract Owned {
    /// @dev `owner` is the only address that can call a function with this
    modifier onlyOwner { require (msg.sender == owner); _; }

    event LogChangeOwner(address _newOwner);

    address public owner;

    /// @notice The Constructor assigns the message sender to be `owner`
    constructor(address _initOwner) public { owner = _initOwner;}

    /// @notice `owner` can step down and assign some other address to this role
    /// @param _newOwner The address of the new owner
    function changeOwner (address _newOwner) external onlyOwner {
        require(_newOwner != address(0));
        owner = _newOwner;
        emit LogChangeOwner(_newOwner);
    }
}