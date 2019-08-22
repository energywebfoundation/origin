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
// @authors: slock.it GmbH;  Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

pragma solidity ^0.5.0;

contract Owned {
    /// @dev `owner` is the only address that can call a function with this
    modifier onlyOwner { require (msg.sender == owner, "msg.sender is not owner"); _; }

    event LogChangeOwner(address _newOwner);

    address public owner;

    /// @notice The Constructor assigns the message sender to be `owner`
    constructor(address _initOwner) public { owner = _initOwner;}

    /// @notice `owner` can step down and assign some other address to this role
    /// @param _newOwner The address of the new owner
    function changeOwner (address _newOwner) external onlyOwner {
        require(_newOwner != address(0),"0x0 as owner not allowed");
        owner = _newOwner;
        emit LogChangeOwner(_newOwner);
    }
}
