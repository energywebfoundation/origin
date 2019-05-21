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

import "../../contracts/Interfaces/ERC20Interface.sol";

contract Erc20TestToken is ERC20Interface {

    string public symbol = "TTK";
    string public name = "TestTokens";
    uint8 public decimas = 18;
    uint public totalSupplyNumber = 100000000000000000000;
    address public owner;

    mapping(address => uint) public balances;
    mapping(address => mapping (address => uint256)) public allowed;

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    constructor(address _testaccount) public {
        owner = msg.sender;
        balances[owner] = totalSupplyNumber-1000000;
        balances[_testaccount] = 1000000;
    }

    function totalSupply() public view returns (uint) {
        return totalSupplyNumber;
    }

    function balanceOf(address _tokenOwner) public view returns (uint) {
        return balances[_tokenOwner];
    }

    function allowance(address _tokenOwner, address _spender) public view returns (uint){
        return allowed[_tokenOwner][_spender];
    }

    function transfer(address _to, uint _tokens) public returns (bool){
        if(balances[msg.sender] >= _tokens && _tokens >0 && balances[_to] + _tokens > balances[_to]) {
            balances[msg.sender] -= _tokens;
            balances[_to] += _tokens;
            emit Transfer(msg.sender,_to, _tokens);
            return true;
        }
        else return false;
    }
    function approve(address _spender, uint _tokens) public returns (bool){
        allowed[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function transferFrom(address _from, address _to, uint _tokens) public returns (bool){
        if (balances[_from] >= _tokens
            && allowed[_from][_to] >= _tokens
            && _tokens > 0
            && balances[_to] + _tokens > balances[_to]) {
            balances[_from] -= _tokens;
            allowed[_from][_to] -= _tokens;
            balances[_to] += _tokens;
            emit Transfer(_from, _to, _tokens);
            return true;
         } else {
            return false;
         }
    }


}
