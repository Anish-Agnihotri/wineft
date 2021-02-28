// SPDX-License-Identifier: MIT

pragma solidity <=0.7.4;

import "./interfaces/IERC165.sol";

/**
  @title Standard ERC165 implementation
  @dev standard interface definition
 */
contract ERC165 is IERC165 {
  
  /**
    @dev return boolean support for IERC165 interfaceId
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return interfaceId == type(IERC165).interfaceId;
  }
}