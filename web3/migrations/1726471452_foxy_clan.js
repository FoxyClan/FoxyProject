const FoxyClan = artifacts.require("FoxyClan");

module.exports = function(deployer) {
  deployer.deploy(FoxyClan);
};
