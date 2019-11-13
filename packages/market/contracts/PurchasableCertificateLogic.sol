pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "@energyweb/erc-test-contracts/contracts/Interfaces/ERC20Interface.sol";
import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/asset-registry/contracts/IAssetLogic.sol";
import "@energyweb/origin/contracts/ICertificateLogic.sol";
import "@energyweb/origin/contracts/CertificateDefinitions.sol";

contract PurchasableCertificateLogic is RoleManagement {

    ICertificateLogic private _certificateLogic;

    struct PurchasableCertificate {
        bool forSale;
        address acceptedToken;
        uint onChainDirectPurchasePrice;
    }

    event LogPublishForSale(uint indexed _certificateId, uint _price, address _token);
    event LogUnpublishForSale(uint indexed _certificateId);

    // Mapping of tokenId to PurchasableCertificate
    mapping(uint256 => PurchasableCertificate) private purchasableCertificates;

    modifier onlyCertificateOwner(uint _certificateId) {
        require(
            _certificateLogic.ownerOf(_certificateId) == msg.sender || isRole(RoleManagement.Role.Matcher, msg.sender),
            "onlyCertificateOwner: not the certificate-owner or market matcher"
        );
        _;
    }

    /*
        Public functions
    */

    function getPurchasableCertificate(uint256 certificateId)
        public view returns (PurchasableCertificate memory)
    {
        // require(certificateId < _certificateLogic.totalSupply(), "getPurchasableCertificate: index out of bounds");
        return purchasableCertificates[certificateId];
    }

    /// @notice makes the certificate available for sale
    /// @param _certificateId The id of the certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function publishForSale(uint _certificateId, uint _price, address _tokenAddress) public onlyCertificateOwner(_certificateId) {
        _setOnChainDirectPurchasePrice(_certificateId, _price);
        _setTradableToken(_certificateId, _tokenAddress);
        purchasableCertificates[_certificateId].forSale = true;

        emit LogPublishForSale(_certificateId, _price, _tokenAddress);
    }

    /// @notice makes the certificate not available for sale
    /// @param _certificateId The id of the certificate
    function unpublishForSale(uint _certificateId) public onlyCertificateOwner(_certificateId) {
        PurchasableCertificate storage pCert = purchasableCertificates[_certificateId];

        pCert.forSale = false;
        emit LogUnpublishForSale(_certificateId);
    }

    /// @notice gets the certificate
    /// @param _certificateId the id of a certificate
    /// @return the certificate (ERC20 contract)
    function getTradableToken(uint _certificateId) public view returns (address) {
        return getPurchasableCertificate(_certificateId).acceptedToken;
    }

    /// @notice buys a certificate
    /// @param _certificateId the id of the certificate
    function buyCertificate(uint _certificateId) public onlyRole(RoleManagement.Role.Trader) {
        _buyCertificate(_certificateId, msg.sender);
    }

    /// @notice buys a certificate for owner
    /// @param _certificateId the id of the certificate
    /// @param _newOwner the address of the new owner
    function buyCertificateFor(uint _certificateId, address _newOwner)
        public
        onlyRole(RoleManagement.Role.Matcher)
        userHasRole(RoleManagement.Role.Trader, _newOwner)
    {
        _buyCertificate(_certificateId, _newOwner);
    }

    /// @notice buys a set of certificates
    /// @param _idArray the ids of the certificates to be bought
    function buyCertificateBulk(uint[] memory _idArray) public onlyRole(RoleManagement.Role.Trader) {
        for (uint i = 0; i < _idArray.length; i++) {
            _buyCertificate(_idArray[i], msg.sender);
        }
    }

    function splitAndBuyCertificate(uint _certificateId, uint _energy) public onlyRole(RoleManagement.Role.Trader) {
        CertificateDefinitions.Certificate memory cert = _certificateLogic.getCertificate(_certificateId);
        PurchasableCertificate memory pCert = getPurchasableCertificate(_certificateId);

        require(_energy > 0 && _energy <= cert.energy, "Energy has to be higher than 0 and lower or equal than certificate energy");

        if (_energy == cert.energy) {
            _buyCertificate(_certificateId, msg.sender);
        } else {
            require(pCert.forSale == true, "Unable to split and buy a certificate that is not for sale.");

            (uint childOneId, uint childTwoId) = _certificateLogic.splitCertificate(_certificateId, _energy);

            _setOnChainDirectPurchasePrice(childOneId, pCert.onChainDirectPurchasePrice);
            _setTradableToken(childOneId, pCert.acceptedToken);

            _setOnChainDirectPurchasePrice(childTwoId, pCert.onChainDirectPurchasePrice);
            _setTradableToken(childTwoId, pCert.acceptedToken);

            emit LogPublishForSale(childOneId, pCert.onChainDirectPurchasePrice, pCert.acceptedToken);
            emit LogPublishForSale(childTwoId, pCert.onChainDirectPurchasePrice, pCert.acceptedToken);

            _buyCertificate(childOneId, msg.sender);
        }
    }

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress) public {
        (uint childOneId, ) = _certificateLogic.splitCertificate(_certificateId, _energy);

        publishForSale(childOneId, _price, _tokenAddress);

        emit LogPublishForSale(childOneId, _price, _tokenAddress);
    }

    /// @notice gets the price for a direct purchase onchain
    /// @param _certificateId the certificate-id
    function getOnChainDirectPurchasePrice(uint _certificateId) public view returns (uint) {
        return getPurchasableCertificate(_certificateId).onChainDirectPurchasePrice;
    }

    /**
        internal functions
    */

    function _buyCertificate(uint _certificateId, address buyer) internal {
        CertificateDefinitions.Certificate memory cert = _certificateLogic.getCertificate(_certificateId);
        PurchasableCertificate memory pCert = getPurchasableCertificate(_certificateId);

        require(buyer != _certificateLogic.ownerOf(_certificateId), "Can't buy your own certificates.");
        require(pCert.forSale == true, "Unable to buy a certificate that is not for sale.");
        require(cert.status == uint(CertificateDefinitions.Status.Active), "You can only buy Active certificates.");

        bool isOnChainSettlement = pCert.acceptedToken != address(0x0);

        if (isOnChainSettlement) {
            ERC20Interface erc20 = ERC20Interface(pCert.acceptedToken);
            require(
                erc20.balanceOf(buyer) >= pCert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough tokens to buy"
            );
            require(
                erc20.allowance(buyer, _certificateLogic.ownerOf(_certificateId)) >= pCert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough allowance to buy"
            );
            erc20.transferFrom(buyer, _certificateLogic.ownerOf(_certificateId), pCert.onChainDirectPurchasePrice);
        } else {
            //  TO-DO: Implement off-chain settlement checks
            //  For now automatically transfer the certificate
            //  if it's an off chain settlement
        }

        _certificateLogic.transferFrom(_certificateLogic.ownerOf(_certificateId), buyer, _certificateId);
        _removeTokenAndPrice(_certificateId);

        unpublishForSale(_certificateId);
    }

    /// @notice sets the price (as ERC20 token) for direct onchain purchasement
    /// @param _certificateId the id of the certificate
    /// @param _price the new price (as ERC20 tokens)
    function _setOnChainDirectPurchasePrice(uint _certificateId, uint _price) internal {
        PurchasableCertificate storage pCert = purchasableCertificates[_certificateId];
        pCert.onChainDirectPurchasePrice = _price;
    }

    /// @notice sets the tradable token (ERC20 contracts) of a certificate
    /// @param _certificateId the certificate ID
    /// @param _token the ERC20-tokenaddress
    function _setTradableToken(uint _certificateId, address _token) internal {
        PurchasableCertificate storage pCert = purchasableCertificates[_certificateId];
        pCert.acceptedToken = _token;
    }

    /// @notice removes accepted token and the price for an certificate
    /// @dev should be called after the transfer of an certificate
    /// @param _certificateId the id of the certificate
    function _removeTokenAndPrice(uint _certificateId) internal {
        _setTradableToken(_certificateId, address(0));
        _setOnChainDirectPurchasePrice(_certificateId, 0);
    }
}