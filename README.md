# Chocolate Supply Chain 
During this project was created supply chain for two entities - beans and product. Beans and product connected as 1:N. UML located at ./UML folder.
### Used libraries
- @openzeppelin/contracts v3.4.1 
- truffle-hdwallet-provider v1.0.17
- ipfs-api v26.1.2

### Also using 
- Truffle v5.3.0
- Node v14.16.0
- web3 v1.3.4

### IPFS 
IPFS used for storing product image. Also web page was upload to IPFS via https://pinata.cloud/. 
**Address**: https://gateway.pinata.cloud/ipfs/QmTHwGVvhMDbShsLUDcsfZDZ6fUHKmBZrbqC3ncnE1TZWP/

### Contract information 
- Rinkeby
	- **Transaction ID**:
	0x823b3de76b095d18db90a7467903dac64173dc173862ed6169bfd4e03e6a541b
	- **Contract Address**: 
	0xF25Ba894e9beAC7750D9c82cB30824CeFb25585C

### Install
```
npm install
truffle compile
cd app 
npm install
```

### Run 
```
cd app
npm run dev
```
