pragma solidity ^0.6.0;

import "./Roles.sol";

contract CarrierRole {
	using Roles for Roles.Role;

	event CarrierAdded(address indexed account);
  	event CarrierRemoved(address indexed account);

  	Roles.Role private carriers;

	constructor() public {
		_addCarrier(msg.sender);
	}

	modifier onlyCarrier() {
		require(isCarrier(msg.sender));
		_;
	}

	function isCarrier(address account) public view returns (bool) {
		return carriers.has(account);
	}

	function addCarrier(address account) public onlyCarrier {
		_addCarrier(account);
	}

	function renounceCarrier() public {
		_removeCarrier(msg.sender);
	}

	function _addCarrier(address account) internal {
		carriers.add(account);
		emit CarrierAdded(account);
	}

	function _removeCarrier(address account) internal {
		carriers.remove(account);
		emit CarrierRemoved(account);
	}
}