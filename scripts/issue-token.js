const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(callback) {

	let tokenFarm = await TokenFarm.deployed()
	tokenFarm.issueTokens()
	
	console.log("Tokens Issued!")
	callback()
}