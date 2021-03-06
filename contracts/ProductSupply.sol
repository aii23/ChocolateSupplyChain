pragma solidity ^0.6.0;

import "./BeansSupply.sol";

contract ProductSupply is BeansSupply {
	enum ProductState { Created, Distributed, Sold }
	struct Product {
		uint sku;
		uint beansSku;
		string imageHash;
		string description;
		bytes32 productType;
		ProductState state;
		address manufacturer;
		address seller;
	}

	mapping(uint => Product) products;

	uint lastProduct;

	event Manufactured(uint indexed sku, address indexed manufacturer);
	event SellerSetted(uint indexed sku);
	event Distributed(uint indexed sku);
	event Sold(uint indexed sku);

	modifier onlyProductState(uint _sku, ProductState _state) {
		require(products[_sku].state == _state);
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

	constructor() BeansSupply() public {
		lastProduct = 0;
	} 

	function manufacture(uint _beansSku, string memory _imageHash, string memory _description, bytes32 _productType) onlyBeansManufectirer(_beansSku) public {
		products[lastProduct] = Product(
			lastProduct, 
			_beansSku, 
			_imageHash,
			_description, 
			_productType, 
			ProductState.Created, 
			msg.sender, 
			address(0)
		);
		emit Manufactured(lastProduct, msg.sender);
		lastProduct += 1; 
	}

	function setSeller(uint _sku, address _seller) onlyProductState(_sku, ProductState.Created) onlyProductManufectirer(_sku) public {
		require(isSeller(_seller));
		products[_sku].seller = _seller;
		emit SellerSetted(_sku);
	}

	function distribute(uint _sku) onlyProductState(_sku, ProductState.Created) onlyProductSeller(_sku) public {
		products[_sku].state = ProductState.Distributed;
		emit Distributed(_sku);
	}

	function sell(uint _sku) onlyProductState(_sku, ProductState.Distributed) onlyProductSeller(_sku) public {
		products[_sku].state = ProductState.Sold;
		emit Sold(_sku);
	}

	function getProductState(uint _sku) view public returns(string memory state) {
		ProductState productState = products[_sku].state;

		if (productState == ProductState.Created) {
			state = "Created";
		} else if (productState == ProductState.Distributed) {
			state = "Distributed";
		} else if (productState == ProductState.Sold) {
			state = "Sold";
		} else {
			state = "Invalid";
		}
	}

	function getProduct(uint _sku) view public returns(
		uint sku,
		uint beansSku,
		string memory imageHash,
		string memory description,
		string memory productType,
		string memory state,
		address manufacturer,
		address seller
	) {
		require(_sku < lastProduct, 'Invalid sku');
		Product memory product = products[_sku];
		sku = product.sku;
		beansSku = product.beansSku;
		imageHash = product.imageHash;
		description = product.description;
		productType = bytes32ToString(product.productType);
		state = getProductState(_sku);
		manufacturer = product.manufacturer;
		seller = product.seller;
	}

	function getBeansByProduct(uint _productSku) view public returns(
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
		require(_productSku < lastProduct, 'Invalid sku');
		return getBeans(products[_productSku].beansSku);
	}
}