pragma solidity ^0.5.0;

import './DappToken.sol';
import './DaiToken.sol';



/* Should use safemath */
contract TokenFarm {

	address public owner; 
	string public name = "DApp Token Farm";


	DappToken public dappToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor (DappToken _dappToken, DaiToken _daiToken) public {
		dappToken = _dappToken;
		daiToken = _daiToken;

		owner = msg.sender;
	}

	// 1. Staking Tokens (Deposit)
	function stakeTokens(uint _amount) public {
		
		// cant stake 0 tokens
		require(_amount > 0, "amount cannot be 0");
		// Let Investor approve staking
		daiToken.approve(msg.sender, _amount);
		// Transfer tokens to be staked to contract
		daiToken.transferFrom(msg.sender, address(this), _amount);
		// Update Staking Balance within App
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
		// Log investor in as having staked
		
		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;
		
	}

	// 2. Unstaking Tokens (Withdraw)
	function unStakeTokens(uint _amount) public {
		// cant stake 0 tokens
		require(_amount > 0, "amount cannot be 0");

		uint balance = stakingBalance[msg.sender];
		require(balance > 0, "staking balance cannot be 0");
		require(_amount <= balance, "cannot unstake more than deposited");
		// Withdraw Token from Contract
		stakingBalance[msg.sender] = stakingBalance[msg.sender] - _amount;
		daiToken.transfer(msg.sender, _amount);
		
		// change status if deposited complete balance
		if(stakingBalance[msg.sender] == 0) {
			isStaking[msg.sender] = false;
		}
	}

	// 3. Issunig Tokens (Reward)
	function issueTokens() public {

		require(owner == msg.sender, "Only the owner can issue Tokens");

		for(uint i = 0; i < stakers.length; i ++ ){
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			uint interestRate = 10; // fraction to be rewarded
			// issue Tokens respective to staked balance
			if(balance >0) {
				dappToken.transfer(recipient, balance/interestRate);
			}
		}
	}

}