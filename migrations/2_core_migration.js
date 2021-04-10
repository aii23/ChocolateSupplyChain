const Core = artifacts.require("Core");

module.exports = function (deployer) {
  deployer.deploy(Core);
};
