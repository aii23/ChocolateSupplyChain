pragma solidity ^0.6.0;

import "./ProductSupply.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Core is ProductSupply, Ownable {
	address public newContractAddress; 

	constructor() Ownable() public {}

	function upgrade(address _newContractAddress) onlyOwner() public {
		require(newContractAddress == address(0));
		newContractAddress = _newContractAddress;
	}
}