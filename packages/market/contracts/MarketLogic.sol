pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/device-registry/contracts/IDeviceLogic.sol";
import "@energyweb/origin/contracts/ICertificateLogic.sol";
import "@energyweb/origin/contracts/CertificateDefinitions.sol";

contract MarketLogic is Initializable, RoleManagement {

    bool private _initialized;
    IDeviceLogic private _deviceLogic;
    ICertificateLogic private _certificateLogic;

    struct PurchasableCertificate {
        string propertiesDocumentHash;
        string documentDBURL;
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
            _certificateLogic.ownerOf(_certificateId) == msg.sender
            || isRole(RoleManagement.Role.Matcher, msg.sender)
            || isRole(RoleManagement.Role.Listener, msg.sender),
            "onlyCertificateOwner: not the certificate-owner, market matcher or listener"
        );
        _;
    }

    function initialize(address certificateLogicContract) public initializer {
        require(certificateLogicContract != address(0), "initialize: Cannot use address 0x0 as certificateLogicContract.");

        _certificateLogic = ICertificateLogic(certificateLogicContract);
        require(_certificateLogic.deviceLogicAddress() != address(0), "initialize: certificateLogic hasn't been initialized yet.");

        _deviceLogic = IDeviceLogic(_certificateLogic.deviceLogicAddress());
        require(_deviceLogic.userLogicAddress() != address(0), "initialize: deviceLogic hasn't been initialized yet.");

        RoleManagement.initialize(_deviceLogic.userLogicAddress());

        _initialized = true;
    }

    function certificateLogicAddress() public view returns (address) {
        require(_initialized == true, "certificateLogicAddress: The contract has not been initialized yet.");
        require(
            address(_certificateLogic) != address(0),
            "certificateLogicAddress: The address is set to 0x0 address."
        );

        return address(_certificateLogic);
    }

    function getPurchasableCertificate(uint certificateId)
        public view returns (PurchasableCertificate memory)
    {
        // require(certificateId < _certificateLogic.totalSupply(), "getPurchasableCertificate: index out of bounds");
        return purchasableCertificates[certificateId];
    }

    /// @notice makes the certificate available for sale
    /// @param _certificateId The id of the certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function publishForSale(
        uint _certificateId,
        uint _price,
        address _tokenAddress,
        string memory _propertiesDocumentHash,
        string memory _documentDBURL
    ) public onlyCertificateOwner(_certificateId) {
        _publishForSale(_certificateId, _price, _tokenAddress, _propertiesDocumentHash, _documentDBURL);

        emit LogPublishForSale(_certificateId, _price, _tokenAddress);
    }

    /// @notice makes the certificate not available for sale
    /// @param _certificateId The id of the certificate
    function unpublishForSale(uint _certificateId) public onlyCertificateOwner(_certificateId) {
        _setForSale(_certificateId, false);
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

    function _splitAndBuyCertificateFor(address _newOwner, uint _certificateId, uint _energy) internal returns (uint, uint) {
        CertificateDefinitions.Certificate memory cert = _certificateLogic.getCertificate(_certificateId);
        PurchasableCertificate memory pCert = getPurchasableCertificate(_certificateId);

        require(_energy > 0 && _energy <= cert.energy, "Energy has to be higher than 0 and lower or equal than certificate energy");
        require(pCert.forSale == true, "Unable to split and buy a certificate that is not for sale.");

        if (_energy == cert.energy) {
            _buyCertificate(_certificateId, _newOwner);
            return (_certificateId, _certificateId);
        } else {
            (uint childOneId, uint childTwoId) = _certificateLogic.splitCertificate(_certificateId, _energy);

            _publishForSale(
                childOneId,
                pCert.onChainDirectPurchasePrice,
                pCert.acceptedToken,
                pCert.propertiesDocumentHash,
                pCert.documentDBURL
            );
            _publishForSale(
                childTwoId,
                pCert.onChainDirectPurchasePrice,
                pCert.acceptedToken,
                pCert.propertiesDocumentHash,
                pCert.documentDBURL
            );

            _buyCertificate(childOneId, _newOwner);
            return (childOneId, childTwoId);
        }
    }

    function splitAndBuyCertificate(uint _certificateId, uint _energy) public onlyRole(RoleManagement.Role.Trader) {
        _splitAndBuyCertificateFor(msg.sender, _certificateId, _energy);
    }

    function splitAndBuyCertificateFor(
        uint _certificateId,
        uint _energy,
        address _newOwner
    ) public onlyRole(RoleManagement.Role.Matcher) userHasRole(RoleManagement.Role.Trader, _newOwner) {
        _splitAndBuyCertificateFor(_newOwner, _certificateId, _energy);
    }

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(
        uint _certificateId,
        uint _energy,
        uint _price,
        address _tokenAddress,
        string memory _propertiesDocumentHash,
        string memory _documentDBURL
    ) public onlyCertificateOwner(_certificateId) {
        (uint childOneId, ) = _certificateLogic.splitCertificate(_certificateId, _energy);

        _publishForSale(childOneId, _price, _tokenAddress, _propertiesDocumentHash, _documentDBURL);
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
            IERC20 erc20 = IERC20(pCert.acceptedToken);
            require(
                erc20.balanceOf(buyer) >= pCert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough tokens to buy"
            );
            require(
                erc20.allowance(buyer, address(this)) >= pCert.onChainDirectPurchasePrice,
                "_buyCertificate: the marketLogic contract should have enough allowance to buy"
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
        purchasableCertificates[_certificateId].onChainDirectPurchasePrice = _price;
    }

    /// @notice sets the tradable token (ERC20 contracts) of a certificate
    /// @param _certificateId the certificate ID
    /// @param _token the ERC20-tokenaddress
    function _setTradableToken(uint _certificateId, address _token) internal {
        purchasableCertificates[_certificateId].acceptedToken = _token;
    }

    /// @notice removes accepted token and the price for an certificate
    /// @dev should be called after the transfer of an certificate
    /// @param _certificateId the id of the certificate
    function _removeTokenAndPrice(uint _certificateId) internal {
        _setTradableToken(_certificateId, address(0));
        _setOnChainDirectPurchasePrice(_certificateId, 0);
    }

    function _setForSale(uint _certificateId, bool _forSale) internal {
        purchasableCertificates[_certificateId].forSale = _forSale;
    }

    function _updateOffChainProperties(
        uint _certificateId,
        string memory _propertiesDocumentHash,
        string memory _documentDBURL
    ) internal {
        purchasableCertificates[_certificateId].propertiesDocumentHash = _propertiesDocumentHash;
        purchasableCertificates[_certificateId].documentDBURL = _documentDBURL;
    }

    function _publishForSale(
        uint _certificateId,
        uint _price,
        address _tokenAddress,
        string memory _propertiesDocumentHash,
        string memory _documentDBURL
    ) internal {
        _setForSale(_certificateId, true);
        _setOnChainDirectPurchasePrice(_certificateId, _price);
        _setTradableToken(_certificateId, _tokenAddress);
        _updateOffChainProperties(_certificateId, _propertiesDocumentHash, _documentDBURL);
    }
}