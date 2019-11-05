// pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2;

// import "@energyweb/origin/contracts/Origin/CertificateLogic.sol";

// contract PurchasableCertificateLogic is CertificateLogic {

//     function buyCertificateInternal(uint _certificateId, address buyer) internal {
//         CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);

//         require(buyer != cert.tradableEntity.owner, "Can't buy your own certificates.");
//         require(cert.tradableEntity.forSale == true, "Unable to buy a certificate that is not for sale.");
//         require(cert.certificateSpecific.status == uint(CertificateSpecificContract.Status.Active), "You can only buy Active certificates.");

//         bool isOnChainSettlement = cert.tradableEntity.acceptedToken != address(0x0);

//         if (isOnChainSettlement) {
//             require(
//                 ERC20Interface(cert.tradableEntity.acceptedToken).transferFrom(
//                     buyer, cert.tradableEntity.owner, cert.tradableEntity.onChainDirectPurchasePrice
//                 ),
//                 "erc20 transfer failed"
//             );
//         } else {
//             //  TO-DO: Implement off-chain settlement checks
//             //  For now automatically transfer the certificate
//             //  if it's an off chain settlement
//         }

//         TradableEntityDBInterface(address(db)).addApprovalExternal(_certificateId, buyer);

//         simpleTransferInternal(cert.tradableEntity.owner, buyer, _certificateId);
//         checktransferOwnerInternally(_certificateId, cert);

//         unpublishForSale(_certificateId);
//     }

//     /// @notice buys a certificate
//     /// @param _certificateId the id of the certificate
//     function buyCertificate(uint _certificateId)
//         external
//         onlyRole(RoleManagement.Role.Trader)
//     {
//         buyCertificateInternal(_certificateId, msg.sender);
//     }

//     /// @notice buys a certificate for owner
//     /// @param _certificateId the id of the certificate
//     /// @param _newOwner the address of the new owner
//     function buyCertificateFor(uint _certificateId, address _newOwner)
//         public
//         onlyRole(RoleManagement.Role.Matcher)
//         userHasRole(RoleManagement.Role.Trader, _newOwner)
//     {
//         buyCertificateInternal(_certificateId, _newOwner);
//     }

//     /// @notice buys a set of certificates
//     /// @param _idArray the ids of the certificates to be bought
//     function buyCertificateBulk(uint[] calldata _idArray) external {
//         for (uint i = 0; i < _idArray.length; i++) {
//             buyCertificateInternal(_idArray[i], msg.sender);
//         }
//     }


//     function splitAndBuyCertificate(uint _certificateId, uint _energy)
//         external
//         onlyRole(RoleManagement.Role.Trader)
//     {
//         CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);

//         require(_energy > 0 && _energy <= cert.tradableEntity.energy, "Energy has to be higher than 0 and lower or equal than certificate energy");

//         if (_energy == cert.tradableEntity.energy) {
//             buyCertificateInternal(_certificateId, msg.sender);
//         } else {
//             require(cert.tradableEntity.forSale == true, "Unable to split and buy a certificate that is not for sale.");

//             (uint childOneId, uint childTwoId) = splitCertificateInternal(_certificateId, _energy);

//             TradableEntityDBInterface(address(db)).setOnChainDirectPurchasePrice(childOneId, cert.tradableEntity.onChainDirectPurchasePrice);
//             TradableEntityDBInterface(address(db)).setTradableToken(childOneId, cert.tradableEntity.acceptedToken);

//             TradableEntityDBInterface(address(db)).setOnChainDirectPurchasePrice(childTwoId, cert.tradableEntity.onChainDirectPurchasePrice);
//             TradableEntityDBInterface(address(db)).setTradableToken(childTwoId, cert.tradableEntity.acceptedToken);

//             emit LogPublishForSale(childOneId, cert.tradableEntity.onChainDirectPurchasePrice, cert.tradableEntity.acceptedToken);
//             emit LogPublishForSale(childTwoId, cert.tradableEntity.onChainDirectPurchasePrice, cert.tradableEntity.acceptedToken);

//             buyCertificateInternal(childOneId, msg.sender);
//         }
//     }

//     /// @notice Splits a certificate and publishes the first split certificate for sale
//     /// @param _certificateId The id of the certificate
//     /// @param _energy The amount of energy in W for the 1st certificate
//     /// @param _price the purchase price
//     /// @param _tokenAddress the address of the ERC20 token address
//     function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress) external {
//         CertificateDB.Certificate memory cert = CertificateDB(address(db)).getCertificate(_certificateId);
//         require(
//             msg.sender == cert.tradableEntity.owner || isRole(RoleManagement.Role.Matcher, msg.sender),
//             "You are not the owner of the certificate"
//         );

//         (uint childOneId, ) = splitCertificateInternal(_certificateId, _energy);

//         TradableEntityDBInterface(address(db)).setOnChainDirectPurchasePrice(childOneId, _price);
//         TradableEntityDBInterface(address(db)).setTradableToken(childOneId, _tokenAddress);
//         TradableEntityDBInterface(address(db)).setForSale(childOneId, true);

//         emit LogPublishForSale(childOneId, _price, _tokenAddress);
//     }
// }
