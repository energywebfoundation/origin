pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Enumerable.sol";

import "./CertificateDefinitions.sol";

contract ICertificateLogic is IERC721, IERC721Enumerable {

    event LogCreatedCertificate(uint indexed _certificateId, uint energy, address owner);
    event LogCertificateClaimed(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

    event CertificationRequestCreated(uint deviceId, uint readsStartIndex, uint readsEndIndex);
    event CertificationRequestApproved(uint deviceId, uint readsStartIndex, uint readsEndIndex);

    /*
        Public functions
    */

    function deviceLogicAddress() public view returns (address);

    /**
     * @dev Gets the token ID at a given index of all the tokens in this contract
     * Reverts if the index is greater or equal to the total number of tokens.
     * @param certificateId uint256 representing the index to be accessed of the tokens list
     * @return uint256 token ID at the given index of the tokens list
     */
    function getCertificate(uint256 certificateId) public view returns (CertificateDefinitions.Certificate memory);

    /// @notice Get the address of the owner of certificate
    /// @param certificateId The id of the certificate
    function getCertificateOwner(uint256 certificateId) public view returns (address);

    /// @notice Request a certificate to claim. Only Certificate owner can claim
    /// @param certificateId The id of the certificate
    function claimCertificate(uint certificateId) public;

    /// @notice claims a set of certificates
    /// @param _idArray the ids of the certificates to be claimed
    function claimCertificateBulk(uint[] memory _idArray) public;

    /// @notice Splits a certificate into two smaller ones, where (total - energy = 2ndCertificate)
    /// @param certificateId The id of the certificate
    /// @param energy The amount of energy in Wh for the 1st certificate
    function splitCertificate(uint certificateId, uint energy) public returns (uint childOneId, uint childTwoId);

    /// @notice gets whether the certificate is claimed
    /// @param _certificateId The id of the requested certificate
    /// @return flag whether the certificate is claimed
    function isClaimed(uint _certificateId) public view returns (bool);

    function getCertificationRequests() public view returns (CertificateDefinitions.CertificationRequest[] memory);

    function getCertificationRequestsLength() public view returns (uint);

    function getDeviceRequestedCertsForSMReadsLength(uint _deviceId) public view returns (uint);

    function requestCertificates(uint _deviceId, uint lastRequestedSMReadIndex) public;

    function approveCertificationRequest(uint _certicationRequestIndex) public;
}