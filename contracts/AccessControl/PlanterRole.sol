pragma solidity ^0.6.0;

import "./Roles.sol";

contract PlanterRole {
	using Roles for Roles.Role;

	event PlanterAdded(address indexed account);
  	event PlanterRemoved(address indexed account);

  	Roles.Role private planters;

	constructor() public {
		_addPlanter(msg.sender);
	}

	modifier onlyPlanter() {
		require(isPlanter(msg.sender));
		_;
	}

	function isPlanter(address account) public view returns (bool) {
		return planters.has(account);
	}

	function addPlanter(address account) public onlyPlanter {
		_addPlanter(account);
	}

	function renouncePlanter() public {
		_removePlanter(msg.sender);
	}

	function _addPlanter(address account) internal {
		planters.add(account);
		emit PlanterAdded(account);
	}

	function _removePlanter(address account) internal {
		planters.remove(account);
		emit PlanterRemoved(account);
	}
}