pragma solidity ^0.5.0;

/// @title this interface defines the required update-function that every updatable-contract has to implement
interface Updatable {
   function update(address _newLogic) external;
   function init(address _database, address _admin) external;
}
