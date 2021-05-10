const TokenFarm = artifacts.require("TokenFarm")
const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")


require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(number) {
	return web3.utils.toWei(String(number), 'ether')
}
contract('TokenFarm', (accounts) => {
// alternativ statt accounts => [owner, investor]
	let daiToken, dappToken, tokenFarm;
	let owner = accounts[0];
	let investor = accounts[1];

	before(async () => {
		// load contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
	
		// transfer all dapp tokens to farm (1 mio)
		await dappToken.transfer(tokenFarm.address, tokens(10**6) )//'1000000000000000000000000')

		// transfer token to investor
		await daiToken.transfer(accounts[1], tokens(100),{from: owner})
	})

	describe('Mock Dai deployment', async () => {
		it('has a name', async () => {

			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp Token deployment', async () => {
		it('has a name', async () => {

			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('Token Farm deployment', async () => {
		it('has a name', async () => {

			const name = await tokenFarm.name()
			assert.equal(name, 'DApp Token Farm')
		})
		it('contract has tokens', async () => {

				let balance = await dappToken.balanceOf(tokenFarm.address)
				assert.equal(balance.toString(), tokens(10**6))
		})
	})

	describe('Farming tokens', async () => {
		it('can stake', async () => {

			let result;
			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(100), 'investor mock DAI balance before staking correct');
			
			//Tokens need to be approved first to be spend transferedFrom by the contract
			await daiToken.approve(tokenFarm.address, tokens(10), {from: investor});
			await tokenFarm.stakeTokens(tokens(10), {from: investor});

			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(90), 'investor mock DAI balance after staking correct');
			
			result = await tokenFarm.hasStaked(investor);
			assert.equal(result.toString() ,'true', 'hasStaked  worked');

			result = await tokenFarm.isStaking(investor);
			assert.equal(result.toString() ,'true', 'isStaking worked');

			result = await tokenFarm.stakingBalance(investor);
			assert.equal(result.toString(), tokens(10), 'investor is staking the right balance');
		})
		it('can issue tokens', async () => {

			let result;

			result = await dappToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(0), 'investor should have zero dapp Tokens after staking reward')
		
			await tokenFarm.issueTokens({from: owner});
			await tokenFarm.issueTokens({from: investor}).should.be.rejected;

			result = await dappToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(1), 'investor should have one dapp token after staking reward')
		})
		it('can unstake tokens', async () => {

			let result;
			// check if initial balance of investor and stakedBalance are correct 
			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(90), 'investor mock DAI balance correct');
			
			result = await tokenFarm.stakingBalance(investor);
			assert.equal(result.toString(), tokens(10), '10 Tokens shoud be staked')

			// withdraw partly and check if balance of investor and stakedBalance are correct
			await tokenFarm.unStakeTokens(tokens(5), {from: investor});
			
			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(95), 'investor mock DAI balance correct after first withdraw');
			
			result = await tokenFarm.stakingBalance(investor);
			assert.equal(result.toString(), tokens(5), '5 Tokens shoud remain after first withdraw')
			/// investor should still be staking
			result = await tokenFarm.isStaking(investor);
			assert.equal(result.toString(), 'true', 'investor should still be staking')
			
			// one shouldnt be able to withdraw more than deposited
			await tokenFarm.unStakeTokens(tokens(10), {from: investor}).should.be.rejected;
			// one shouldnt be able to withdraw from other account
			await tokenFarm.unStakeTokens(tokens(10), {from: owner}).should.be.rejected;

			// cash out completely
			await tokenFarm.unStakeTokens(tokens(5), {from: investor});
			result = await daiToken.balanceOf(investor);
			assert.equal(result.toString(), tokens(100), 'investor mock DAI balance correct after first withdraw');
			
			result = await tokenFarm.stakingBalance(investor);
			assert.equal(result.toString(), tokens(0), '5 Tokens shoud remain after first withdraw')
			
			result = await tokenFarm.isStaking(investor);
			assert.equal(result.toString(), 'false', 'investor should not be staking anymore')			
		})
	})
})