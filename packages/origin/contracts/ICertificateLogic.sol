pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Enumerable.sol";

import "./CertificateDefinitions.sol";

contract ICertificateLogic is IERC721, IERC721Enumerable {

    event LogCreatedCertificate(uint indexed _certificateId, uint energy, address owner);
    event LogCertificateClaimed(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

    event LogPublishForSale(uint indexed _certificateId, uint _price, address _token);
    event LogUnpublishForSale(uint indexed _certificateId);

    event CertificationRequestCreated(uint assetId, uint readsStartIndex, uint readsEndIndex);
    event CertificationRequestApproved(uint assetId, uint readsStartIndex, uint readsEndIndex);

    /*
        Public functions
    */

    function assetLogicAddress() public view returns (address);

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
    function splitCertificate(uint certificateId, uint energy) public;

    /// @notice gets whether the certificate is claimed
    /// @param _certificateId The id of the requested certificate
    /// @return flag whether the certificate is claimed
    function isClaimed(uint _certificateId) public view returns (bool);

    /// @notice makes the certificate available for sale
    /// @param _certificateId The id of the certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function publishForSale(uint _certificateId, uint _price, address _tokenAddress) public;

    /// @notice makes the certificate not available for sale
    /// @param _certificateId The id of the certificate
    function unpublishForSale(uint _certificateId) public;

    /// @notice gets the certificate
    /// @param _certificateId the id of a certificate
    /// @return the certificate (ERC20 contract)
    function getTradableToken(uint _certificateId) public view returns (address);

    /// @notice buys a certificate
    /// @param _certificateId the id of the certificate
    function buyCertificate(uint _certificateId) public;

    /// @notice buys a certificate for owner
    /// @param _certificateId the id of the certificate
    /// @param _newOwner the address of the new owner
    function buyCertificateFor(uint _certificateId, address _newOwner) public;

    /// @notice buys a set of certificates
    /// @param _idArray the ids of the certificates to be bought
    function buyCertificateBulk(uint[] memory _idArray) public;

    function splitAndBuyCertificate(uint _certificateId, uint _energy) public;

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress) public;

    /// @notice gets the price for a direct purchase onchain
    /// @param _certificateId the certificate-id
    function getOnChainDirectPurchasePrice(uint _certificateId) public view returns (uint);

    function getCertificationRequests() public view returns (CertificateDefinitions.CertificationRequest[] memory);

    function getCertificationRequestsLength() public view returns (uint);

    function getAssetRequestedCertsForSMReadsLength(uint _assetId) public view returns (uint);

    function requestCertificates(uint _assetId, uint lastRequestedSMReadIndex) public;

    function approveCertificationRequest(uint _certicationRequestIndex) public;
}