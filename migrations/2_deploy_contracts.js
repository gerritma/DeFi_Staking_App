
const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");

module.exports = async function(deployer, network, accounts) {
  
  // Deploy mockDai
	await deployer.deploy(DaiToken);
	const daiToken = await DaiToken.deployed();
	// Deploy dappToken
	await deployer.deploy(DappToken);
	const dappToken = await DappToken.deployed();
	// Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  // Transfer dappToken to tokenFarm
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');
 
  // Transfer mockDai to investor (2nd Ganache Account)
  await daiToken.transfer(accounts[1], '100000000000000000000');
};
