// SPDX-License-Identifier: MIT

pragma solidity <=0.7.4;

import "./ERC165.sol";
import "./interfaces/IERC721.sol";

/**
  @title WineToken is an NFT that exponentially increases in price, and timelock per redemption
  @dev Extends OpenZeppelin ERC721 (implemented with an array of structs), without safeTransfer parameters for contract interactions
  @dev Unoptimized (uint256 can be optimized to uint16, etc.). But screw it, L2 can take the pain
 */
contract WineToken is ERC165, IERC721 {
  uint public _mintCost = 0.01 ether; // Cost to mint new token

  struct Token {
    uint256 appearance; // Appearance of token
    uint256 nextTransfer; // Timestamp of next elibible transfer
    uint256 numTransfers; // Number of already completed transfers
  }

  /**
    @dev checks if tokenId exists
    @param tokenId to check for existance
   */
  modifier tokenExists(uint256 tokenId) {
    // Require tokenId owner to be set to other than 0x0 address
    require(_owners[tokenId] != address(0), "ERC721: Token does not exist");
    _;
  }

  /**
    @dev checks if token is transferrable
    @param from address of expected token owner
    @param to address of recipient
    @param tokenId to check for
   */
  modifier tokenTransferrable(address from, address to, uint256 tokenId) {
    require(_owners[tokenId] != address(0), "ERC721: Token does not exist"); // Check if token exists
    require(from != address(0), "ERC721: From address set to 0x0"); // Ensure from address is not 0x0
    require(to != address(0), "ERC721: To address set to 0x0"); // Ensure to address is not 0x0
    require(from == _owners[tokenId], "ERC721: Mismatched owner address for token"); // Ensure that the from address owns the token
    require(_tokens[tokenId].nextTransfer <= block.timestamp, "ERC721: Token is timelocked"); // Ensure that token transfer timelock has expired

    // Ensure either:
    // 1. Contract caller owns the token
    // 2. Contract caller is approved to spend the token
    // 3. Contract caller is approved to manage all tokens for the owner address
    require(msg.sender == from || msg.sender == _approvals[tokenId] || _operators[from][msg.sender], "ERC721: Incorrect transfer permissions");
    _;
  }

  Token[] public _tokens; // Array of tokens
  mapping (uint256 => address) private _owners; // tokenId => owner address
  mapping (address => uint256) private _balances; // owner address => count of owned tokens
  mapping (uint256 => address) private _approvals; // tokenId => approved spending address
  mapping (address => mapping (address => bool)) private _operators; // owner address => approved operator addresses

  /**
    @dev collect token count of owner address
    @param owner queried address
   */
  function balanceOf(address owner) external view override returns (uint256 balance) {
    return _balances[owner];
  }

  /**
    @dev returns owner of a token (requires token to exist)
    @param tokenId to check owner for
   */
  function ownerOf(uint256 tokenId) external view override tokenExists(tokenId) returns (address owner) {
    return _owners[tokenId];
  }

  /**
    @dev returns total count of minted tokens
   */
  function tokenCount() external view returns (uint256) {
    return _tokens.length;
  }

  /**
    @dev returns timelock expiry status for a tokenId (assuming existance)
    @param tokenId to check timelock expiry for
   */
  function tokenTimelockExpired(uint256 tokenId) external view tokenExists(tokenId) returns (bool) {
    return _tokens[tokenId].nextTransfer <= block.timestamp;
  }

  /**
    @dev Transfer token and emit transfer event
   */
  function _transfer(address from, address to, uint256 tokenId) internal tokenTransferrable(from, to, tokenId) {
    // Nullify owner approvals
    _approve(address(0), tokenId);

    _balances[from] -= 1; // Decrement from balance
    _balances[to] += 1; // Incremenet to balance
    _owners[tokenId] = to; // Change owner of tokenId

    Token storage _token = _tokens[tokenId]; // Collect token from storage
    _token.nextTransfer = block.timestamp + (((_token.numTransfers + 1) ** 2) * 3600); // Update timelock
    _token.numTransfers += 1; // Update number of transfers

    // Emit transfer event
    emit Transfer(from, to, tokenId);
  }

  /**
    @dev transfer token tokenId from address "from" to address "to"
    @param from address of token owner
    @param to address of recipient
    @param tokenId to transfer
   */
  function transferFrom(address from, address to, uint256 tokenId) external override {
    _transfer(from, to, tokenId);
  }

  /**
    @dev approve an address to manage tokenId
    @param to address to approve
    @param tokenId to approve for
   */
  function _approve(address to, uint256 tokenId) internal {
    // Approve address to manage tokenId
    address _to = address(to);
    _approvals[tokenId] = _to;

    // Emit approval event
    emit Approval(_owners[tokenId], to, tokenId);
  }

  /**
    @dev approve an address to transfer tokenId (ensuring ownership and existance)
    @param to address to approve
    @param tokenId to approve for
   */
  function approve(address to, uint256 tokenId) external override tokenExists(tokenId) {
    require(msg.sender != to, "ERC721: Approval to current owner"); // Ensure not a self-approve
    require(msg.sender == _owners[tokenId] || _operators[_owners[tokenId]][msg.sender], "ERC721: Incorrect transfer permissions"); // Ensure token management ability

    // Call approve
    _approve(to, tokenId);
  }

  /**
    @dev check if address is approved to transfer tokenId (ensuring existance of token)
    @param tokenId to check for
   */
  function getApproved(uint256 tokenId) external view override tokenExists(tokenId) returns (address operator) {
    return _approvals[tokenId];
  }

  /**
    @dev set approval for an address to manage all of an owners tokens
    @param operator to give control to
    @param _approved management state to toggle for operator
   */
  function setApprovalForAll(address operator, bool _approved) external override {
    require(msg.sender != operator, "ERC721: Cannot self-approve"); // Restrict against self-delegation

    _operators[msg.sender][operator] = _approved; // Change operator status
    emit ApprovalForAll(msg.sender, operator, _approved); // Emit ApprovalForAll
  }

  /**
    @dev check if operator is approved for all of an owners tokens
    @param owner address of token owner
    @param operator address of token operator to check for
   */
  function isApprovedForAll(address owner, address operator) external view override returns (bool) {
    return _operators[owner][operator];
  }

  /**
    @dev generates pseudorandom appearance of WineToken
   */
  function _getAppearance() internal view returns (uint256) {
    // Not random, gameable, but serves the purpose of a demo
    return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
  }

  /**
    @dev mints new token to address to, with id of tokenId
   */
  function _mint(address to, uint256 tokenId) internal {
    // Update balances and ownership of token
    _balances[to] += 1;
    _owners[tokenId] = to;

    // Push new token to tokens array
    _tokens.push(Token(_getAppearance(), block.timestamp, 0));

    // Exponentially increase cost to mint tokens
    _mintCost *= 2;

    // Emit mint event (Transfer from 0x0)
    emit Transfer(address(0), to, tokenId);
  }

  /**
    @dev mints new token to address, assuming sent ether >= _mintCost
    @param to address to mint to
   */
  function mint(address to) external payable {
    require(msg.value >= _mintCost, "ERC721: Insufficient ether provided for mint"); // Enforce minimum minting cost

    _mint(to, _tokens.length); // Mint new token
  }

  /**
    @dev NOT IMPLEMENTED: safe transfer for interactions with contracts
   */
  function safeTransferFrom(address from, address to, uint256 tokenId) public override {
    _transfer(from, to, tokenId);
  }

  /**
    @dev NOT IMPLEMENTED: safe transfer for interactions with contracts
   */
  function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) public override {
    _transfer(from, to, tokenId);
  }
}