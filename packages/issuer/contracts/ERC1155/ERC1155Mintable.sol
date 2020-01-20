pragma solidity ^0.5.0;

import "./ERC1155.sol";

/**
    @dev Mintable form of ERC1155
    Shows how easy it is to mint new items.
*/
contract ERC1155Mintable is ERC1155 {

    bytes4 constant private INTERFACE_SIGNATURE_URI = 0x0e89341c;

    // id => creators
    mapping (uint256 => address) public creators;

    // A nonce to ensure we have a unique id each time we mint.
    uint256 public nonce;

    modifier creatorOnly(uint256 _id) {
        require(creators[_id] == msg.sender);
        _;
    }

    function supportsInterface(bytes4 _interfaceId)
    public
    view
    returns (bool) {
        if (_interfaceId == INTERFACE_SIGNATURE_URI) {
            return true;
        } else {
            return super.supportsInterface(_interfaceId);
        }
    }

    // Creates a new token type and assigns _initialSupply to minter
    function create(uint256 _initialSupply, string calldata _uri, address creator) external returns(uint256 _id) {

        _id = ++nonce;
        creators[_id] = creator;
        balances[_id][creator] = _initialSupply;

        // require(balances[_id][creator] > 0, "balance not increased");

        // Transfer event with mint semantic
        emit TransferSingle(creator, address(0x0), creator, _id, _initialSupply);

        if (bytes(_uri).length > 0)
            emit URI(_uri, _id);
    }

    // Mint tokens. Assign directly to _to.
    function mint(uint256 _id, address _to, uint256 _quantity) external creatorOnly(_id) {

        // Grant the items to the caller
        balances[_id][_to] = _quantity.add(balances[_id][_to]);

        // Emit the Transfer/Mint event.
        // the 0x0 source address implies a mint
        // It will also provide the circulating supply info.
        emit TransferSingle(msg.sender, address(0x0), _to, _id, _quantity);

        if (_to.isContract()) {
            _doSafeTransferAcceptanceCheck(msg.sender, msg.sender, _to, _id, _quantity, '');
        }
    }

    function setURI(string calldata _uri, uint256 _id) external creatorOnly(_id) {
        emit URI(_uri, _id);
    }
}