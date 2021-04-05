import Web3 from "web3";
import "./style.css";
import productSupplyArtifact from "../../build/contracts/ProductSupply.json";

function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('./images/', true, /\.png$/));

const App = {
    web3: null,
    account: null,
    meta: null,
    beans: {}, 
    product: {},

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
    	'InTransfer',
    	'Transfered'
    ],

    updateProductEvents: [
    	'Distributed',
    	'Sold'
    ],

    start: async function() {
        const { web3 } = this;

        try {
            // get contract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = productSupplyArtifact.networks[networkId];
            this.meta = new web3.eth.Contract(
                productSupplyArtifact.abi,
                deployedNetwork.address,
            );

            // get accounts
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
        } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
    },

    // Method for button #queryBeansButton
    queryBeans() {
        let beansId = this.getInput('queryBeansId');
        this.getDataAndRefresh('Beans', beansId);
    },

    // Method for button #queryProductButton
    queryProduct() {
        let productId = this.getInput('queryProductId');
        this.getDataAndRefresh('Product', productId)
    },

    getDataAndRefresh: async function(dataType, id) {
    	console.log(`${dataType} : ${id}`);
        if (dataType == 'Beans') {
        	console.log(id);
            await this.getDataByBeans(id);
        } else if (dataType == 'Product') {
            await this.getDataByProduct(id);
        } else {
            throw new Error('Wrong error');
        }

        console.log(this.beans);
        console.log(this.product);

        this.updateData(); 
        //this.updateGraphics();
        //this.updateButtons();
        //this.setEvents();
    },

    getDataByBeans: async function(beansId) {
        const { getBeans } = this.meta.methods;
        const { getProductByBeans } = this.meta.methods;

        try {
        	console.log(getBeans);
        	console.log(beansId)
        	console.log(await getBeans(beansId).call());
            this.beans = await getBeans(beansId).call();
            console.log(this.beans);
            this.product = await getProductByBeans(beansId).call();
        } catch(e) {
            console.log(e);
        }
    },

    getDataByProduct: async function(ptoductId) {
        const { getProduct } = this.meta.methods;
        const { getBeansByProduct } = this.meta.methods;

        try {
            this.beans = await getBeansByProduct(productId).call();
            this.product = await getProduct(productId).call();
        } catch(e) {
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
            graphics.children[i].classList.add('completed');
        }

        if (status != 'Sold') {
            graphics.children[position].classList.add('in_progress');
        } else {
            graphics.children[position].classList.add('completed');
        }
    },

    removeGraphicsClasses: function() {
        this.graphicsItemsId.forEach((id) => {
            let image = document.getElementById(id);
            console.log(image);
            image.classList.remove('in_process');
            image.classList.remove('completed');
        });
    },

    updateButtons: function() {
        const beansState = this.getInput('State');
        const productState = this.getInput('ProductState');

        disableAllButtons();
        switch(beansState) {
            case 'Planted':
                if (beans.planter == address) {
                    enableButton('collectButton');
                }
                break;
            case 'Collected':
                if (beans.planter == address && beans.carrier == "") {
                    enableButton('setCarrierButton');
                }

                if (beans.carrier == address) {
                    enableButton('startTranferButton');
                }
                break;
            case 'InTransfer':
                /// setManufacturer
                // endTransfer
                if (beans.carrier == address && beans.manufacturer == "") {
                    enableButton('setManufactirerButton');
                }

                if (beans.manufacturer == address) {
                    enableButton('endTransferButton');
                }
                break;
            case 'Transfered':
                if (beans.carrier == address) {
                    enableButton('manufacureButton');
                }
                break;
        }

        switch(productState) {
            case 'Created':
                if (product.manufacturer == address) {
                    enableButton('setSellerButton');
                }

                if (product.seller == address) {
                    enableButton('distributeButton');
                }
                break;
            case 'Distributed':
                if (product.seller == address) {
                    enableButton('sellButton');
                }
                break;
        }
    },

    disableAllButtons: function() {
        this.disabledButtonsList.forEach((id) => disableButton(id));
    },

    disableButton: function(id) {
        document.getElementById(id).disabled = false;
    },

    enableButton: function(id) {
        document.getEleementById(id).disabled = true;
    },

    setEvents: function() {
    	this.meta.events.Planted({
    		filter: { planter: address }
    	}, function(error, event) { console.log(event); })
    	.on('data', (event) => {
    		let beansId = event.returnValues.sku;
    		this.getDataAndRefresh('Beans', beansId);
    	});

    	this.meta.events.Created({
    		filter: { manufacturer: address }
    	}, (error, event) => console.log(event))
    	.on('data', (event) => {
    		let productId = event.returnValues.sku;
    		this.getDataAndRefresh('Product', productId);
    	});


    	if (isBenasOnly()) {
    		let beansId = this.beans.sku;
    		this.updateBeansEvents.forEach((event) => this.meta.events[event]({
    			filter: { sku: this.beansId }
    		}, (error, event) => console.log(event))
    		.on('data', (event) => {
    			getDataAndRefresh('Beans', beans.sku)
    		}));
    	}

    	if (isProduct()) {
    		let productId = this.product.sku;
    		this.updateProductEvents.forEach((event) => this.meta.events[event]({
    			filter: { sku: productId }
    		}, (error, event) => console.log(event))
    		.on('data', (event) => {
    			getDataAndRefresh('Product', product.sku);
    		}));
    	}
    },

    isNoBeans: function () {
    	return this.beans.sku == "";
    },

    isBeansOnly: function () {
    	return this.beans.sku != "" && this.product.sku == "";
    },

    isProduct: function () {
    	return this.product.sku != "";
    },

    plant: async function() {
        const brand = Web3.utils.asciiToHex(this.getInput('in_brand'));
        const country = Web3.utils.asciiToHex(this.getInput('in_country'));
        let { plant } = this.meta.methods;
        await plant(brand, country).send({ from: this.account });
    },

    collect: async function() {
        const beansId = this.beans.sku;
        const weight = this.getInput('in_weight');
        const weightMeasure = this.getInput('in_measure');
        let { collect } = this.meta.methods;
        await collect(beansId, weight, weightMeasure).send({ from: account });
    },

    setCarrier: async function() {
        const beansId = this.beans.sku;
        const carrier = this.getInput('in_carrier');
        let { setCarrier } = this.meta.methods;
        await setCarrier(beansId, carrier).send({ from: account });
    },

    startTransfer: async function() {
        const beansId = this.beans.sku;
        let { startTransfer } = this.meta.methods;
        await startTransfer(beandId).send({ from: account });
    },

    setManufacturer: async function() {
        const beansId = this.beans.sku;
        const manufacture = this.getInput('in_manufacturer');
        let { setManufacturer } = this.meta.methods;
        await setManufacturer(beansId, manufacture).send({ from: account });
    },

    endTransfer: async function() {
        const beansId = this.beans.sku;
        const { endTransfer } = this.meta.methods;
        await endTransfer(beansId).send({ from: account });
    },

    manufacture: async function() {
        const beansId = this.beans.sku;
        const description = this.getInput('in_description');
        const productType = this.getInput('in_productType');
        const { manufacture } = this.meta.methods;
        await manufacture(beansId, description, productType).send({ from: account });
    },

    setSeller: async function() {
        const productId = this.product.sku;
        const seller = this.getInput('in_seller');
        const { setSeller } = this.meta.methods;
        await setSeller(productId, seller).send({ from: account });
    },

    distribute: async function() { 
        const productId = this.product.sku;
        const { distribute } = this.meta.methods;
        await distribute(productId).send({ from: account });
    },

    sell: async function() {
        const productId = this.product.sku;
        const { sell } = this.meta.methods;
        await sell(productId).send({ from: account });
    },

    getInput: function(id) {
        return document.getElementById(id).value;
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
