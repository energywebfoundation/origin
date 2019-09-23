// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;


pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../../contracts/Origin/CertificateDB.sol";

interface CertificateInterface {

    /// @notice buys a certificate
    /// @param _certificateId the id of the certificate to be bought
    function buyCertificate(uint _certificateId) external;

    /// @notice buys a set of certificates
    /// @param _idArray the ids of the certificates to be bought
    function buyCertificateBulk(uint[] calldata _idArray) external;

    /// @notice splits a certificate
    /// @param _certificateId the id of the certificate to be splitted
    /// @param _energy the energy to be splitted from the parent certificate
    function splitCertificate(uint _certificateId, uint _energy) external;

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in Wh for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress) external;

    /// @notice gets the certificate
    /// @param _certificateId the id of the certificate
    /// @return the Certificate struct
    function getCertificate(uint _certificateId) external view returns (CertificateDB.Certificate memory certificate);

    /// @notice gets the length of all created certificates
    /// @return the length of all created certificates
    function getCertificateListLength() external view returns (uint);

    /// @notice gets the certificate's owner
    /// @param _certificateId the certificate-id
    /// @return the owner of a certificate
    function getCertificateOwner(uint _certificateId) external view returns (address);

    /// @notice gets whether a certificate is retired
    /// @param _certificateId the id of a certificate
    /// @return flag whether the certificate is already retired
    function isRetired(uint _certificateId) external view returns (bool);
}
