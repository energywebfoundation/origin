pragma solidity ^0.5.2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

contract IUserLogic {

    event UserUpdated(address _user);

    /// @notice function to deactive an use, only executable for user-admins
    /// @param _user the user that should be deactivated
    function deactivateUser(address _user) external;

    /// @notice function that can be called to create a new user in the storage-contract, only executable by user-admins!
    /// @notice if the user does not exists yet it will be created, otherwise the older userdata will be overwritten
	/// @param _propertiesDocumentHash document-hash with all the properties of the demand
	/// @param _documentDBURL url-address of the demand
    /// @param _user address of the user
    /// @param _organization organization the user is representing
    function createUser(string calldata _propertiesDocumentHash, string calldata _documentDBURL, address _user, string calldata _organization) external;

    /// @notice function to set / edit the rights of an user / account, only executable for Top-Admins!
    /// @param _user user that rights will change
    /// @param _rights rights encoded as bitmask
    function setRoles(address _user, uint _rights) external;

    /// @notice function to return all the data of an user
    /// @param _user user
    /// @return returns user
    function getFullUser(address _user) public returns (string memory _propertiesDocumentHash, string memory _documentDBURL, string memory _organization, uint _roles, bool _active);

    /// @notice function that checks if there is an user for the provided ethereum-address
    /// @param _user ethereum-address of that user
    /// @return bool if the user exists
    function doesUserExist(address _user) external view returns (bool);

    /// @notice function to retrieve the rights of an user
    /// @dev if the user does not exist in the mapping it will return 0x0 thus preventing them from accidently getting any rights
    /// @param _user user someone wants to know its rights
    /// @return bitmask with the rights of the user
    function getRolesRights(address _user) external view returns (uint);

    /// @notice Updates existing user with new properties
	/// @dev will return an event with the event-Id
	/// @param _user user address
    /// @param _propertiesDocumentHash document-hash with all the properties of the user
	/// @param _documentDBURL url-address of the user
    function updateUser(address _user, string calldata _propertiesDocumentHash, string calldata _documentDBURL) external;
}
