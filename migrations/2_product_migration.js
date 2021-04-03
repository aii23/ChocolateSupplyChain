const ProductSupply = artifacts.require("ProductSupply");

module.exports = function (deployer) {
  deployer.deploy(ProductSupply);
};
