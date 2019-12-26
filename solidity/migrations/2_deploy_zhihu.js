const Zhihu = artifacts.require("Zhihu");

module.exports = function(deployer) {
  deployer.deploy(Zhihu);
};