const ProductSupply = artifacts.require("ProductSupply");

var accounts;


//!!!!!!!! Сравнивать BN через chai

const beansField = {
    'sku': 0,
    'weight': 1,
    'brand': 2,
    'weightMeasure': 3,
    'state': 4,
    'country': 5,
    'planter': 6,
    'carrier': 7,
    'manufacturer': 8
};

const beansFields = [
	'sku',
	'weight',
	'brand',
	'weightMeasure',
	'state',
	'country',
	'pkanter',
	'carrier',
	'manufacturer'
];

const productFields = [
	'sku',
	'beansSku',
	'description',
	'productType',
	'state',
	'manufacturer',
	'seller'
];

async function getBeans(instance, sku) {
	let beans = await instance.getBeans(sku);
	let result = {};
	console.log(beans);
	beans.forEach((elem, index) => result[beans[index]] = elem);
	return result;
}

async function getProduct(instance, sku) {
	let product = await instance.getProduct(sku);
	let result = {};
	product.forEach((elem, index) => result[product[index]] = elem);
	return result;
}

contract('ProductSupply', (accs) => {
    accounts = accs;
});

	// contract('ProductSupply', (accs) => {
 //    	accounts = accs;
	// });

	// it('Can plant', async () => {
	// 	let brand = 'Forastero';
	// 	let country = 'MX';
	// 	let instance = await ProductSupply.deployed();
	// 	let logs = await instance.plant(brand, country, { from: planter });
	// 	assert.equal(logs.length, 1);

	// 	let log = logs[0];
	// 	assert.equal(log.event, 'Planted');
	// 	assert.equal(log.args.planter, planter);
	// 	beansId = log.args.sku;

	// 	let beans = await getBeans(instance, beansId);

	// 	assert.equal(beans.brand, brand);
	// 	assert.equal(beans.country, country);
	// 	assert.equal(beans.planter, planter);
	// 	assert.equal(beans.state, 'Planted');
	// });


describe('Simple Forward Process', async () => {

	let planter = accounts[0];
	let carrier = accounts[1];
	let manufacturer = accounts[2];
	let seller = accounts[3];
	let beansId = ""; 
	let productId = "";

	contract('ProductSupply', (accs) => {
    	accounts = accs;
	});

	it('Can plant', async () => {
		let brand = 'Forastero';
		let country = 'MX';
		let instance = await ProductSupply.deployed();
		let { logs } = await instance.plant(web3.utils.asciiToHex(brand), web3.utils.asciiToHex(country), { from: planter });
		//console.log(logs);
		assert.ok(Array.isArray(logs));
		assert.equal(logs.length, 1);

		let log = logs[0];
		assert.equal(log.event, 'Planted');
		assert.equal(log.args.planter, planter);
		beansId = log.args.sku;

		let beans = await instance.getBeans(beansId);
		// console.log(beans);
		// let beans = await getBeans(instance, beansId);

		assert.equal(beans.brand, brand);
		assert.equal(beans.country, country);
		assert.equal(beans.planter, planter);
		assert.equal(beans.state, 'Planted');
	});

	it('Can collect', async () => {
		let instance = await ProductSupply.deployed();
		let weight = 1000;
		let weightMeasure = 'kg';
		await instance.collect(beansId, weight, web3.utils.asciiToHex(weightMeasure), { from: planter });
		let beans = await instance.getBeans(beansId);
		// let beans = await getBeans(instance, beansId);
		assert.equal(beans.weight, weight);
		assert.equal(beans.weightMeasure, weightMeasure);
		assert.equal(beans.state, "Collected");
	});

	it('Can set carrier', async () => {
		let instance = await ProductSupply.deployed();
		await instance.setCarrier(beansId, carrier, { from: planter });
		let beans = await instance.getBeans(beansId);
		// let beans = await getBeans(instance, beansId);
		assert.equal(beans.carrier, carrier);
	});

	it('Can start transfer', async () => {
		let instance = await ProductSupply.deployed();
		await instance.startTransfer(beansId, { from: carrier });
		let beans = await instance.getBeans(beansId);
		// let beans = await getBeans(instance, beansId);
		assert.equal(beans.state, 'InTransfer');
	});

	it('Can set manufacturer', async () => {
		let instance = await ProductSupply.deployed();
		await instance.setManufacturer(beansId, manufacturer, { from: carrier });
		let beans = await instance.getBeans(beansId);
		// let beans = await getBeans(instance, beansId);
		assert.equal(beans.manufacturer, manufacturer);
	});

	it('Can end transfer', async () => {
		let instance = await ProductSupply.deployed();
		await instance.endTransfer(beansId, { from: manufacturer });
		let beans = await instance.getBeans(beansId);
		// let beans = await getBeans(instance, beansId);
		assert.equal(beans.state, "Transfered");
	});

	it('Can manufecture', async () => {
		let instance = await ProductSupply.deployed();
		let description = 'Chocolate bar';
		let productType = 'Chocolate';
		let { logs } = await instance.manufacture(beansId, description, web3.utils.asciiToHex(productType), { from: manufacturer});
		assert.equal(logs.length, 1);
		let log = logs[0];
		assert.equal(log.event, 'Manufactured');
		assert.equal(log.args.manufacturer, manufacturer);
		productId = log.args.sku;

		let product = await instance.getProduct(productId);
		// console.log(product);
		// let product = getProduct(productId);
		assert.equal(product.beansSku.toString(), beansId.toString());
		assert.equal(product.description, description);
		assert.equal(product.productType, productType);
		assert.equal(product.state, 'Created');
	});

	it('Can set seller', async () => {
		let instance = await ProductSupply.deployed();
		await instance.setSeller(productId, seller, { from: manufacturer });

		let product = await instance.getProduct(productId);
		// let product = getProduct(productId);
		assert.equal(product.seller, seller);
	});

	it('Can distribute', async () => {
		let instance = await ProductSupply.deployed();
		await instance.ditribute(productId, { from: seller });
		let product = await instance.getProduct(productId);
		// let product = getProduct(productId);
		assert.equal(product.state, 'Distributed');
	});

	it('Can sell', async () => {
		let instance = await ProductSupply.deployed();
		await instance.sell(productId, { from: seller });
		let product = await instance.getProduct(productId);
		// let product = getProduct(productId);
		assert.equal(product.state, 'Sold');
	});
});