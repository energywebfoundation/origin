pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "../../contracts/Interfaces/ERC721TokenReceiver.sol";

contract TestReceiver is ERC721TokenReceiver {

    ERC721 public entityContract;

    constructor(ERC721 _entityContract) public {
        entityContract = _entityContract;
    }

    /// @notice Handle the receipt of an NFT
    /// @dev The ERC721 smart contract calls this function on the recipient
    ///  after a `transfer`. This function MAY throw to revert and reject the
    ///  transfer. Return of other than the magic value MUST result in the
    ///  transaction being reverted.
    ///  Note: the contract address is always the message sender.
    /// @param _operator The address which called `safeTransferFrom` function
    /// @param _from The address which previously owned the token
    /// @param _tokenId The NFT identifier which is being transferred
    /// @param _data Additional data with no specified format
    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    ///  unless throwing
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4){
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function safeTransferFrom(address _from, address _to, uint256 _entityId) external payable {
    
        entityContract.safeTransferFrom(_from, _to, _entityId);
    }

    function safeTransferFrom(address _from, address _to, uint256 _entityId, bytes calldata _data) external payable {
    
        entityContract.safeTransferFrom(_from, _to, _entityId, _data);
    }
}
    
