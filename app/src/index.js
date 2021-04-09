import Web3 from "web3";
import "./style.css";
import productSupplyArtifact from "../../build/contracts/ProductSupply.json";
const IPFS = require('ipfs-api')

function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('./images/', true, /\.png$/));

const App = {
    web3: null,
    account: null,
    meta: null,
    ipfs: null,
    beans: {}, 
    product: {},
    imageBuffer: null,

    buffer: Buffer, //!!!

    disabledButtonsList: [
        'collectButton',
        'setCarrierButton',
        'startTranferButton',
        'setManufactirerButton',
        'endTransferButton',
        'manufacureButton',
        'setSellerButton',
        'distributeButton',
        'sellButton'
    ],

    graphicsItemsId: [
        'Plant',
        'PlantArrow',
        'Ship',
        'ShipArrow',
        'Facory',
        'FactoryArrow',
        'Seller',
        'SellerArrow'
    ],

    statusPosition: {
        'Planted': 0,
        'Collected': 1,
        'InTransfer': 2,
        'Transfered': 4,
        'Created': 5,
        'Distributed': 6,
        'Sold': 7
    },

    updateBeansEvents: [
    	'Collected',
        'CarrierSetted',
    	'InTransfer',
        'ManufacturerSetted',
    	'Transfered'
    ],

    updateProductEvents: [
        'SellerSetted',
    	'Distributed',
    	'Sold'
    ],

    beansFields: [
        "sku", "weight", "brand", "weightMeasure", "state", "country", "planter", "carrier", "manufacturer"
    ],

    productFields: [
        "sku", "imageHash", "description", "productType", "state", "seller"
    ],

    start: async function() {
        const { web3 } = this;

        try {
            // get contract instance
            console.log('Start');
            const networkId = await web3.eth.net.getId();
            console.log(networkId);
            const deployedNetwork = productSupplyArtifact.networks[networkId];
            console.log(deployedNetwork);
            this.meta = new web3.eth.Contract(
                productSupplyArtifact.abi,
                deployedNetwork.address,
            );

            // get accounts
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
            
            this.ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
        } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
    },

    // Method for button #queryBeansButton
    queryBeans() {
        let beansId = this.getAndClearInput('queryBeansId');
        this.getDataAndRefresh('Beans', beansId);
        this.setEvents();
    },

    // Method for button #queryProductButton
    queryProduct() {
        let productId = this.getAndClearInput('queryProductId');
        this.getDataAndRefresh('Product', productId);
        this.setEvents();
    },

    getDataAndRefresh: async function(dataType, id) {
    	console.log(`${dataType} : ${id}`);
        if (dataType == 'Beans') {
            await this.getDataByBeans(id);
        } else if (dataType == 'Product') {
            await this.getDataByProduct(id);
        } else {
            throw new Error('Wrong error');
        }

        console.log(this.beans);
        console.log(this.product);

        this.updateData(); 
        this.updateGraphics();
        this.updateButtons();
        // this.setEvents();
    },

    getDataByBeans: async function(beansId) {
        const { getBeans } = this.meta.methods;
        const { getProductByBeans } = this.meta.methods;

        try {
            this.beans = await getBeans(beansId).call();
            this.product = this.getEmptyProduct();
        } catch(e) {
            console.log(e);
            this.beans = this.getEmptyBeans(); 
            this.beans.sku = 'Invalid sku';
            this.product = this.getEmptyProduct();
            return;
        }
        /*
        try {
            this.product = await getProductByBeans(beansId).call();
        } catch(e) {
            console.log(e);
            this.product = this.getEmptyProduct();
        }
        */
    },

    getDataByProduct: async function(productId) {
        const { getProduct } = this.meta.methods;
        const { getBeansByProduct } = this.meta.methods;

        try {
            this.beans = await getBeansByProduct(productId).call();
        } catch (e) {
            console.log(e);
            this.beans = this.getEmptyBeans(); 
            this.product = this.getEmptyProduct();
            this.product.sku = 'Invalid sku';
            return;
        }

        try {
            this.product = await getProduct(productId).call();
        } catch (e) {
            console.log(e);
        }
    },

    updateData: function() {
        const beansIdElement = document.getElementById('BeansId');
        const beansWeightElement = document.getElementById('BeansWeight');
        const brandElement = document.getElementById('Brand');
        const weightMeasure = document.getElementById('WeightMeasure');
        const stateElement = document.getElementById('State');
        const countryElement = document.getElementById('Country');
        const planterElement = document.getElementById('Planter');
        const carrierElement = document.getElementById('Carrier');
        const manufacturerElement = document.getElementById('Manufacturer');
        const productIdElement = document.getElementById('ProductId');
        const productImageElement = document.getElementById('ProductImage');
        const productDescriptionElement = document.getElementById('ProductDescription');
        const productTypeElement = document.getElementById('ProductType');
        const productStateElement = document.getElementById('ProductState');
        const productSellerElement = document.getElementById('ProductSeller');

        beansIdElement.innerHTML = this.beans.sku;
        beansWeightElement.innerHTML = this.beans.weight;
        brandElement.innerHTML = this.beans.brand;
        weightMeasure.innerHTML = this.beans.weightMeasure;
        stateElement.innerHTML = this.beans.state;
        countryElement.innerHTML = this.beans.country;
        planterElement.innerHTML = this.beans.planter;
        carrierElement.innerHTML = this.beans.carrier;
        manufacturerElement.innerHTML = this.beans.manufacturer;
        productIdElement.innerHTML = this.product.sku;
        productImageElement.src = 'https://ipfs.io/ipfs/' + this.product.imageHash;
        productDescriptionElement.innerHTML = this.product.description;
        productTypeElement.innerHTML = this.product.productType;
        productStateElement.innerHTML = this.product.state;
        productSellerElement.innerHTML = this.product.seller;
    },

    updateGraphics: function() {
        const beansState = this.getInput('State');
        const productState = this.getInput('ProductState');

        this.removeGraphicsClasses();

        if (this.beans.sku == "") {
            return;
        }

        let status = this.product.sku != "" ? this.product.state : this.beans.state;

        let position = this.statusPosition[status];
        let graphics = document.getElementById('graphics');

        for (let i = 0; i < position; i++) {
            graphics.children[i].classList.remove('inactive');
            graphics.children[i].classList.add('completed');
        }

        if (status != 'Sold') {
            graphics.children[position].classList.remove('inactive');
            graphics.children[position].classList.add('in_process');
        } else {
            graphics.children[position].classList.remove('inactive');
            graphics.children[position].classList.add('completed');
        }
    },

    removeGraphicsClasses: function() {
        this.graphicsItemsId.forEach((id) => {
            let image = document.getElementById(id);
            console.log(image);
            image.classList.remove('in_process');
            image.classList.remove('completed');
            image.classList.add('inactive');
        });
    },

    updateButtons: function() {
        const beansState = this.beans.state;
        const productState = this.product.state;

        this.disableAllButtons();
        switch(beansState) {
            case 'Planted':
                if (this.beans.planter == this.account) {
                    this.enableButton('collectButton');
                }
                break;
            case 'Collected':
                if (this.beans.planter == this.account && Web3.utils.toBN(this.beans.carrier).isZero()) {
                    this.enableButton('setCarrierButton');
                }

                if (this.beans.carrier == this.account) {
                    this.enableButton('startTranferButton');
                }
                break;
            case 'InTransfer':
                /// setManufacturer
                // endTransfer
                if (this.beans.carrier == this.account && Web3.utils.toBN(this.beans.manufacturer).isZero()) {
                    this.enableButton('setManufactirerButton');
                }

                if (this.beans.manufacturer == this.account) {
                    this.enableButton('endTransferButton');
                }
                break;
            case 'Transfered':
                if (this.beans.carrier == this.account && this.product.state == "") {
                    this.enableButton('manufacureButton');
                }
                break;
        }

        switch(productState) {
            case 'Created':
                if (this.product.manufacturer == this.account && Web3.utils.toBN(this.product.seller).isZero()) {
                    this.enableButton('setSellerButton');
                }

                if (this.product.seller == this.account) {
                    this.enableButton('distributeButton');
                }
                break;
            case 'Distributed':
                if (this.product.seller == this.account) {
                    this.enableButton('sellButton');
                }
                break;
        }
    },

    disableAllButtons: function() {
        this.disabledButtonsList.forEach((id) => this.disableButton(id));
    },

    disableButton: function(id) {
        document.getElementById(id).disabled = true;
    },

    enableButton: function(id) {
        document.getElementById(id).disabled = false;
    },

    setEvents: function() {
    	// this.meta.events.Planted({
    	// 	filter: { planter: this.account }
    	// }, function(error, event) { console.log(event); })
    	// .on('data', (event) => {
    	// 	let beansId = event.returnValues.sku;
    	// 	this.getDataAndRefresh('Beans', beansId);
    	// });

    	// this.meta.events.Created({
    	// 	filter: { manufacturer: this.account }
    	// }, (error, event) => console.log(event))
    	// .on('data', (event) => {
    	// 	let productId = event.returnValues.sku;
    	// 	this.getDataAndRefresh('Product', productId);
    	// });


    	let beansId = this.beans.sku;
    	this.updateBeansEvents.forEach((event) => this.meta.events[event]({
    		filter: { sku: this.beansId }
    	}, (error, event) => {
            if (error) {
                console.log(error);
            }
            console.log(event);
            this.getDataAndRefresh('Beans', this.beans.sku);
        }));

    	if (this.isProduct()) { ///!!! Не робит
    		let productId = this.product.sku;
    		this.updateProductEvents.forEach((event) => this.meta.events[event]({
    			filter: { sku: productId }
    		}, (error, event) => {
                if (error) {
                    console.log(error);
                }
                this.getDataAndRefresh('Product', this.product.sku);
            }));
    	}
    },

    isNoBeans: function () {
    	return this.beans.state == "";
    },

    isBeansOnly: function () {
    	return this.beans.state != "" && this.product.state == "";
    },

    isProduct: function () {
    	return this.product.state != "";
    },

    plant: async function() {
        const brand = Web3.utils.asciiToHex(this.getAndClearInput('in_brand'));
        const country = Web3.utils.asciiToHex(this.getAndClearInput('in_country'));
        let { plant } = this.meta.methods;

        this.meta.once('Planted', {
            filter: { planter: this.account }
        }, (error, event) => {
            if (error) {
                console.log(error);
            }
            let beansId = event.returnValues.sku;
            console.log(beansId);
            this.getDataAndRefresh('Beans', beansId);
        });
        // this.meta.events.Planted({
        //     filter: { planter: this.account }
        // }, function(error, event) { console.log(event); })
        // .on('data', (event) => {
        //     console.log('Here');
        //     let beansId = event.returnValues.sku;
        //     this.getDataAndRefresh('Beans', beansId);
        // });

        await plant(brand, country).send({ from: this.account });
    },

    collect: async function() {
        const beansId = this.beans.sku;
        const weight = this.getAndClearInput('in_weight');
        const weightMeasure = Web3.utils.asciiToHex(this.getAndClearInput('in_measure'));
        let { collect } = this.meta.methods;
        await collect(beansId, weight, weightMeasure).send({ from: this.account });
    },

    setCarrier: async function() {
        const beansId = this.beans.sku;
        const carrier = this.getAndClearInput('in_carrier');
        let { setCarrier } = this.meta.methods;
        await setCarrier(beansId, carrier).send({ from: this.account });
    },

    startTransfer: async function() {
        const beansId = this.beans.sku;
        let { startTransfer } = this.meta.methods;
        await startTransfer(beansId).send({ from: this.account });
    },

    setManufacturer: async function() {
        const beansId = this.beans.sku;
        const manufacture = this.getAndClearInput('in_manufacturer');
        let { setManufacturer } = this.meta.methods;
        await setManufacturer(beansId, manufacture).send({ from: this.account });
    },

    endTransfer: async function() {
        const beansId = this.beans.sku;
        const { endTransfer } = this.meta.methods;
        await endTransfer(beansId).send({ from: this.account });
    },

    manufacture: async function() {
        const beansId = this.beans.sku;
        const description = this.getAndClearInput('in_description');
        const productType = Web3.utils.asciiToHex(this.getAndClearInput('in_productType'));
        const { manufacture } = this.meta.methods;

        let imageHash = await this.ipfsUploadImage();

        this.meta.once('Manufactured', {
            filter: { manufacturer: this.account }
        }, (error, event) => {
            if (error) {
                console.log(error);
            }
            let productId = event.returnValues.sku;
            this.getDataAndRefresh('Product', productId);
        });

        await manufacture(beansId, imageHash, description, productType).send({ from: this.account });
    },

    setSeller: async function() {
        const productId = this.product.sku;
        const seller = this.getAndClearInput('in_seller');
        const { setSeller } = this.meta.methods;
        await setSeller(productId, seller).send({ from: this.account });
    },

    distribute: async function() { 
        const productId = this.product.sku;
        const { distribute } = this.meta.methods;
        await distribute(productId).send({ from: this.account });
    },

    sell: async function() {
        const productId = this.product.sku;
        const { sell } = this.meta.methods;
        await sell(productId).send({ from: this.account });
    },

    getInput: function(id) {
        return document.getElementById(id).value;
    },

    getAndClearInput: function(id) {
        let result = document.getElementById(id).value;
        document.getElementById(id).value = "";
        return result;
    },

    getEmptyBeans: function() {
        let result = {};
        this.beansFields.forEach(field => result[field] = "");
        return result;
    },

    getEmptyProduct: function() {
        let result = {};
        this.productFields.forEach(field => result[field] = "");
        return result;
    },

    ipfsUploadImage: function() {
        //App.ipfs.files.add((new TextEncoder).encode('12345'), (error, result) => {console.log(error); console.log(result);})
        if (!this.imageBuffer) {
            console.log('No image');
            throw Error('No image');
        }

        return this.ipfs.files.add(this.imageBuffer).
        then(res => res[0].hash).
        catch(error => console.log(error));

        // this.ipfs.files.add(this.imageBuffer, (error, result) => {
        //     if (error) {
        //         console.log(error);
        //         return;
        //     }

        //     this.imageHash = result[0].hash; 
        // });
    },

    imageUpload: function() {
        let file = document.getElementById('image_input').files[0];
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
            this.imageBuffer = Buffer(reader.result);
            console.log(this.imageBuffer);
        }
    }
};

window.App = App;

window.addEventListener("load", async function() {
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
    }

    App.start();
});
