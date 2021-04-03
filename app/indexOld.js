import Web3 from "web3";
import productSupplyArtifact from "../build/contracts/ProductSupply.json";

const App = {
    web3: null,
    account: null,
    meta: null,
    beans: {}, 
    product: {},

    disabledButtonsList = [
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

    graphicsItemsId = [
        'Plant',
        'PlantArrow',
        'Ship',
        'ShipArrow',
        'Facory',
        'FactoryArrow',
        'Seller',
        'SellerArrow'
    ],

    statusPosition = {
        'Planted': 0,
        'Collected': 1,
        'InTransfer': 2,
        'Transfered': 4,
        'Created': 5,
        'Distributed': 6,
        'Sold': 7
    },

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
        let beansId = getInput('queryBeansId');
        getDataAndRefresh('Beans', beansId);
    },

    // Method for button #queryProductButton
    queryProduct() {
        let productId = getInput('queryProductId');
        getDataAndRefresh('Product', productId)
    },

    getDataAndRefresh(dataType, id) {
        if (dataType == 'Beans') {
            getDataByBeans(id);
        } else if (dataType == 'Product') {
            getDataByProduct(id);
        } else {
            throw new Error('Wrong error');
        }

        updateData(); 
        updateGraphics();
        updateButtons();
    },

    getDataByBeans: async function(beansId) {
        const { getBeans } = this.meta.methods;
        const { getProductByBeans } = this.metha.methods;

        try {
            beans = await getBeans(benasId).call();
            product = await getProductByBeans(benasId).call();
        } catch(e) {
            console.log(e);
        }
    },

    getDataByProduct: async function(ptoductId) {
        const { getProduct } = this.meta.methods;
        const { getBeansByProduct } = this.metha.methods;

        try {
            beans = await getBeansByProduct(productId).call();
            product = await getProduct(productId).call();
        } catch(e) {
            console.log(e);
        }
    },

    udpdateData: function() {
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
        const productSellerElement = document.getElementById('Seller');

        beansIdElement.innerHTML = beans.sku;
        beansWeightElement.innerHTML = beans.weight;
        brandElement.innerHTML = beans.brand;
        weightMeasure.innerHTML = beans.weightMeasure;
        stateElement.innerHTML = beans.state;
        countryElement.innerHTML = beans.country;
        planterElement.innerHTML = beans.planter;
        carrierElement.innerHTML = beans.carrier;
        manufacturerElement.innerHTML = beans.manufacturer;
        productIdElement.innerHTML = product.sku;
        productDescriptionElement.innerHTML = product.description;
        productTypeElement.innerHTML = product.productType;
        productStateElement.innerHTML = product.state;
        productSellerElement.innerHTML = product.seller;
    },

    updateGraphics: function() {
        const beansState = getInput('State');
        const productState = getInput('ProductState');

        removeGraphicsClasses();

        if (beans.sku == "") {
            return;
        }

        let status = product.sku != "" ? product.state : beans.state;

        let position = statusPosition[status];
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
        graphicsItemsId.forEach((id) => {
            let image = document.getElementById(id);
            image.classList.remove('in_process');
            image.classList.remove('completed');
        });
    },

    updateButtons: function() {
        const beansState = getInput('State');
        const productState = getInput('ProductState');

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
        disabledButtonsList.forEach((id) => disableButton(id));
    },

    disableButton: function(id) {
        document.getElementById(id).disabled = false;
    },

    enableButton: function(id) {
        document.getEleementById(id).disabled = true;
    },

    plant: async function() {
        const beansId = beans.sku;
        const brand = getInput('in_brand');
        const country = getInput('in_country');
        let { plant } = this.meta.methods;
        await plant(beansId, brand, country).send({ from: account });
    },

    collect: async function(weight, weightMeasure) {
        const beansId = beans.sku;
        const weight = getInput('in_weight');
        const weightMeasure = getInput('in_measure');
        let { collect } = this.meta.methods;
        await collect(beansId, weight, weightMeasure).send({ from: account });
    },

    setCarrier: async function() {
        const beansId = beans.sku;
        const carrier = getInput('in_carrier');
        let { setCarrier } = this.meta.methods;
        await setCarrier(beansId, carrier).send({ from: account });
    },

    startTransfer: async function() {
        const beansId = beans.sku;
        let { startTransfer } = this.meta.methods;
        await startTransfer(beandId).send({ from: account });
    },

    setManufacturer: async function() {
        const beansId = beans.sku;
        const manufacture = getInput('in_manufacturer');
        let { setManufacturer } = this.meta.methods;
        await setManufacturer(beansId, manufacture).send({ from: account });
    },

    endTransfer: async function() {
        const beansId = beans.sku;
        const { endTransfer } = this.meta.methods;
        await endTransfer(beansId).send({ from: account });
    },

    manufacture: async function() {
        const beansId = beans.sku;
        const description = getInput('in_description');
        const productType = getInput('in_productType');
        const { manufacture } = this.meta.methods;
        await manufacture(beansId, description, productType).send({ from: account });
    },

    setSeller: async function() {
        const productId = product.sku;
        const seller = getInput('in_seller');
        const { setSeller } = this.meta.methods;
        await setSeller(productId, seller).send({ from: account });
    },

    distribute: async function() { 
        const productId = product.sku;
        const { distribute } = this.meta.methods;
        await distribute(productId).send({ from: account });
    },

    sell: async function() {
        const productId = product.sku;
        const { sell } = this.meta.methods;
        await sell(productId).send({ from: account });
    }

    getInput: function(id) {
        return document.getElementById(id).innerHTML;
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
