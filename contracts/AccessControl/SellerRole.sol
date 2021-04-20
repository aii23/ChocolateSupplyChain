pragma solidity ^0.6.0;

import "./Roles.sol";

contract SellerRole {
	using Roles for Roles.Role;

	event SellerAdded(address indexed account);
  	event SellerRemoved(address indexed account);

  	Roles.Role private seller;

	constructor() public {
		_addSeller(msg.sender);
	}

	modifier onlySeller() {
		require(isSeller(msg.sender));
		_;
	}

	function isSeller(address account) public view returns (bool) {
		return seller.has(account);
	}

	function addSeller(address account) public onlySeller {
		_addSeller(account);
	}

	function renounceSeller() public {
		_removeSeller(msg.sender);
	}

	function _addSeller(address account) internal {
		seller.add(account);
		emit SellerAdded(account);
	}

	function _removeSeller(address account) internal {
		seller.remove(account);
		emit SellerRemoved(account);
	}
}