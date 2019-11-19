pragma solidity ^0.5.2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract Erc20TestToken is Initializable, ERC20, ERC20Detailed {

    function initialize(address testAccount) public initializer {
        ERC20Detailed.initialize("TestToken", "TTK", 18);

        _mint(msg.sender, 100000000000000000000);
        _transfer(msg.sender, testAccount, 1000000);
    }
}