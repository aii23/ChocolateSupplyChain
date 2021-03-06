pragma solidity ^0.6.0;

import "./Helper.sol";
import "./AccessControl/PlanterRole.sol";
import "./AccessControl/ManufacturerRole.sol";
import "./AccessControl/SellerRole.sol";
import "./AccessControl/CarrierRole.sol";

contract BeansSupply is Helper, PlanterRole, ManufacturerRole, SellerRole, CarrierRole {
	enum BeansState { Planted, Collected, InTransfer, Transfered }
	struct Beans {
		uint sku;
		uint64 weight;
		bytes32 brand;
		bytes2 weightMeasure;
		BeansState state;
		bytes2 country;
		address planter;
		address carrier;
		address manufacturer;
	}

	mapping(uint => Beans) beans;

	uint lastBeans;

	event Planted(uint indexed sku, address indexed planter);
	event Collected(uint indexed sku); 
	event CarrierSetted(uint indexed sku);
	event InTransfer(uint indexed sku);
	event ManufacturerSetted(uint indexed sku);
	event Transfered(uint indexed sku);

	modifier onlyBeansState(uint _sku, BeansState _state) {
		require(beans[_sku].state == _state);
		_;
	}

	modifier onlyBeansPlanter(uint _sku) {
		require(beans[_sku].planter == msg.sender);
		_;
	}

	modifier onlyBeansCarrier(uint _sku) {
		require(beans[_sku].carrier == msg.sender);
		_;
	}

	modifier onlyBeansManufectirer(uint _sku) {
		require(beans[_sku].manufacturer == msg.sender);
		_;
	}

	constructor() public {
		lastBeans = 0;
	} 

	function plant(bytes32 _brand, bytes2 _country) public onlyPlanter {
		beans[lastBeans] = Beans(
			lastBeans, 
			0, 
			_brand, 
			"", 
			BeansState.Planted, 
			_country, 
			msg.sender, 
			address(0), 
			address(0)
		);
		emit Planted(lastBeans, msg.sender);
		lastBeans += 1; 
	}

	function collect(uint _sku, uint64 _weight, bytes2 _weightMeasure) onlyBeansState(_sku, BeansState.Planted) onlyBeansPlanter(_sku) public {
		beans[_sku].state = BeansState.Collected; 
		beans[_sku].weight = _weight;
		beans[_sku].weightMeasure = _weightMeasure;
		emit Collected(_sku);
	}

	function setCarrier(uint _sku, address _carrier) onlyBeansState(_sku, BeansState.Collected) onlyBeansPlanter(_sku) public {
		require(isCarrier(_carrier));
		beans[_sku].carrier = _carrier;
		emit CarrierSetted(_sku);
	}

	function startTransfer(uint _sku) onlyBeansState(_sku, BeansState.Collected) onlyCarrier onlyBeansCarrier(_sku) public {
		beans[_sku].state = BeansState.InTransfer;
		emit InTransfer(_sku);
	}

	function setManufacturer(uint _sku, address _manufacturer) onlyBeansState(_sku, BeansState.InTransfer) onlyCarrier onlyBeansCarrier(_sku) public {
		require(isManufacturer(_manufacturer));
		beans[_sku].manufacturer = _manufacturer;
		emit ManufacturerSetted(_sku);
	}

	function endTransfer(uint _sku) onlyBeansState(_sku, BeansState.InTransfer) onlyBeansManufectirer(_sku) public {
		beans[_sku].state = BeansState.Transfered;
		emit Transfered(_sku);
	}

	function getBeansState(uint _sku) public view returns (string memory result) {
		BeansState state = beans[_sku].state;

		if (state == BeansState.Planted) {
			result = "Planted";
		} else if (state == BeansState.Collected) {
			result = "Collected";
		} else if (state == BeansState.InTransfer) {
			result = "InTransfer";
		} else if (state == BeansState.Transfered) {
			result = "Transfered";
		} else {
			result = "Invalid";
		}
	}

	function getBeans(uint _sku) public view returns (
		uint sku,
		uint64 weight,
		string memory brand,
		string memory weightMeasure,
		string memory state,
		string memory country,
		address planter,
		address carrier,
		address manufacturer
	) {
		require(_sku < lastBeans, 'Invalid sku');
		Beans memory curBeans = beans[_sku];
		sku = curBeans.sku;
		weight = curBeans.weight;
		brand = bytes32ToString(curBeans.brand);
		weightMeasure = bytes2ToString(curBeans.weightMeasure);
		state = getBeansState(_sku); 
		country = bytes2ToString(curBeans.country);
		planter = curBeans.planter;
		carrier = curBeans.carrier;
		manufacturer = curBeans.manufacturer;
	}
}