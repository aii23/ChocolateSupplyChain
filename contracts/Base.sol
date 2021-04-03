pragma solidity ^0.5.16;

contract Base {
	enum BeansState { Planted, Collected, InTransfer, Transfered, Manufactured }
	struct Beans {
		uint sku;
		uint64 weight;
		bytes32 brand;
		bytes3 weightMeasure;
		BeansState state;
		bytes2 country;
		address planter;
		address carrier;
		address manufacturer;
	}

	enum ProductState { Created, Distributed, Sold }
	struct Product {
		uint sku;
		uint beansSku;
		string description;
		bytes32 productType;
		ProductState state;
		address manufacturer;
		address seller;
	}

	Beans[] beans; 
	uint lastBeans;
	Product[] products;
	uint lastProduct;

	event Planted(uint sku);
	event Collected(uint sku); 
	event InTransfer(uint sku);
	event Transfered(uint sku);
	event manufactured(uint sku);

	modifier onlyBeansState(uint _sku, BeansState _state) {
		require(beans[_sku].state == _state);
		_;
	}

	modifier onlyProductState(uint _sku, ProductState _state) {
		require(products[_sku].state == _state);
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

	modifier onlyManufectirer(uint _sku) {
		require(beans[_sku].manufacturer == msg.sender);
		_;
	}

	modifier onlyProductManufectirer(uint _sku) {
		require(products[_sku].manufacturer == msg.sender);
		_;
	}

	modifier onlyProductSeller(uint _sku) {
		require(products[_sku].seller == msg.sender);
		_;
	}

	constructor() public {
		lastBeans = 0;
		lastProduct = 0;
	} 

	function plant(bytes32 _brand, bytes2 _country) public {
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
		emit Planted(lastBeans);
		lastBeans += 1; 
	}

	function collect(uint _sku, uint64 _weight, bytes3 _weightMeasure) onlyBeansState(_sku, BeansState.Planted) onlyBeansPlanter(_sku) public {
		beans[_sku].state = BeansState.Collected; 
		beans[_sku].weight = _weight;
		beans[_sku].weightMeasure = _weightMeasure;
		emit Collected(_sku);
	}

	function setCarrier(uint _sku, address _carrier) onlyBeansState(_sku, BeansState.Collected) onlyBeansPlanter(_sku) public {
		beans[_sku].carrier = _carrier;
	}

	function startTransfer(uint _sku) onlyBeansState(_sku, BeansState.Collected) onlyBeansCarrier(_sku) public {
		beans[_sku].state = BeansState.InTransfer;
		emit InTransfer(_sku);
	}

	function setmanufacturer(uint _sku, address _manufacturer) onlyBeansState(_sku, BeansState.InTransfer) onlyBeansCarrier(_sku) public {
		beans[_sku].manufacturer = _manufacturer;
	}

	function endTransfer(uint _sku) onlyBeansState(_sku, BeansState.InTransfer) onlyManufectirer(_sku) public {
		beans[_sku].state = BeansState.Transfered;
		emit Transfered(_sku);
	}

	function manufacture(uint _beansSku, string memory _description, bytes32 _productType) onlyManufectirer(_beansSku) public {
		beans[_beansSku].state = BeansState.Manufactured;
		products[lastProduct] = Product(
			lastProduct, 
			_beansSku, 
			_description, 
			_productType, 
			ProductState.Created, 
			msg.sender, 
			address(0)
		);
		emit manufactured(lastProduct);
		lastProduct += 1; 
	}

	function setSeller(uint _sku, address _seller) onlyProductState(_sku, ProductState.Created) onlyProductManufectirer(_sku) public {
		products[_sku].seller = _seller;
	}

	function ditribute(uint _sku) onlyProductState(_sku, ProductState.Created) onlyProductSeller(_sku) public {
		products[_sku].state = ProductState.Distributed;
	}

	function sell(uint _sku) onlyProductState(_sku, ProductState.Distributed) onlyProductSeller(_sku) public {
		products[_sku].state = ProductState.Sold;
	}
} 