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

import "../../contracts/Origin/EnergyCertificateBundleDB.sol";

interface EnergyCertificateBundleInterface {

    /// @notice retires a bundle
    /// @param _bundleId the id of a bundle
    function retireBundle(uint _bundleId) external;

    /// @notice gets a bundle struct
    /// @param _bundleId the id of a bundle
    /// @return the EnergyCertificateBundle-struct
    function getBundle(uint _bundleId) external view returns (EnergyCertificateBundleDB.EnergyCertificateBundle memory);

    /// @notice gets the amount of bundles created
    /// @return number of bundles created
    function getBundleListLength() external view returns (uint);

    /// @notice gets the owner of a bundle
    /// @param _bundleId the id of a bundle
    /// @return the owner of a bundle
    function getBundleOwner(uint _bundleId) external view returns (address);

    /// @notice gets whether a bundle is retired
    /// @param _bundleId the id of a bundle
    /// @return whether the bundle is retired yet
    function isRetired(uint _bundleId) external view returns (bool);
}
