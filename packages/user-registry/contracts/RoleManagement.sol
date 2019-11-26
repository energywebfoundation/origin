pragma solidity ^0.5.2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "./IRoles.sol";
import "./IUserLogic.sol";

/// @notice contract for managing the rights and roles
contract RoleManagement is Initializable {

    /// @notice all possible available roles
    /*
    no role:        0x0...------0 = 0
    UserAdmin:      0x0...------1 = 1
    AssetAdmin:     0x0...-----1- = 2
    AssetManager:   0x0...----1-- = 4
    Trader:         0x0...---1--- = 8
    Matcher:        0x0...--1---- = 16
    Issuer:         0x0...-1----- = 32
    Listener:         0x0...1------ = 64
    */
    enum Role {
        UserAdmin,
        AssetAdmin,
        AssetManager,
        Trader,
        Matcher,
        Issuer,
        Listener
    }

    ///@param contract-lookup for users
    IUserLogic public userLogicContract;

    /// @notice modifier for checking if an user is allowed to execute the intended action
    /// @param _role one of the roles of the enum Role
    modifier onlyRole(RoleManagement.Role _role) {
        require(isRole(_role, msg.sender), "user does not have the required role");
        _;
    }

    /// @notice modifier for checking that only a certain account can do an action
    /// @param _accountAddress the account that should be allowed to do that action
    modifier onlyAccount(address _accountAddress) {
        require(msg.sender == _accountAddress, "account is not accountAddress");
        _;
    }

    /// @notice modifier that checks, whether an user exists
    /// @param _user the user that has to be checked for existence
    modifier userExists(address _user){
        require(IRoles(address(userLogicContract)).doesUserExist(_user), "User does not exist");
        _;
    }

    /// @notice modifier that checks, whether a user has a certain role
    /// @param _role one of the roles of the enum Role
    /// @param _user the address of the user to be checked for the role
    modifier userHasRole(RoleManagement.Role _role, address _user){
        require (isRole(_role, _user), "user does not have the required role");
        _;
    }

    /// @notice constructor
    /// @param _userLogicContract contract-lookup instance
    function initialize(address _userLogicContract) public initializer {
        userLogicContract = IUserLogic(_userLogicContract);
    }

    /// @notice function for comparing the role and the needed rights of an user
    /// @param _role role of a user
    /// @param _caller the user trying to call the action
    /// @return whether the user has the corresponding rights for the intended action
    function isRole(RoleManagement.Role _role, address _caller) public view returns (bool) {
        /// @dev reading the rights for the user from the userDB-contract
        uint rights = IRoles(address(userLogicContract)).getRolesRights(_caller);
        /// @dev converting the used enum to the corresponding bitmask
        uint role = uint(2) ** uint(_role);
        /// @dev comparing rights and roles, if the result is not 0 the user has the right (bitwise comparison)
        /// we also don't have to check for a potential overflow here, because the used enum will prevent using roles that do not exist
        return (rights & role != 0);
    }
}
