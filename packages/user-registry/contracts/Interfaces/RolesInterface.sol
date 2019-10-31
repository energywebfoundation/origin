pragma solidity ^0.5.0;

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
