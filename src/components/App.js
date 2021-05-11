import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
   }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. Maybe try MetaMask.')
    }
  }

  async loadBlockchainData () {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()

    this.setState({account: accounts[0]})

    const networkId = await web3.eth.net.getId()
    // console.log(networkId)

    // load Dai Token
    const daiTokenData = DaiToken.networks.[networkId]
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({daiToken})
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({daiTokenBalance: daiTokenBalance.toString()})
      // console.log(web3.utils.fromWei(daiTokenBalance, 'ether'))
    } else {
      window.alert('DaiToken ccontract not deployed to detected Network.')
    }

    // load Dapp Token
    const dappTokenData = DappToken.networks.[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({dappToken})
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({dappTokenBalance: dappTokenBalance.toString()})
      // console.log(web3.utils.fromWei(dappTokenBalance, 'ether'))
    } else {
      window.alert('DappToken ccontract not deployed to detected Network.')
    }

    // load Dapp Token Farm
    const tokenFarmData = TokenFarm.networks.[networkId]
    if(dappTokenData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({tokenFarm})
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({stakingBalance: stakingBalance.toString()})
      // console.log(web3.utils.fromWei(stakingBalance, 'ether'))
    } else {
      window.alert('TokenFarm ccontract not deployed to detected Network.')
    }

    // Done loading
    this.setState({loading :false})
  }

  stakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash)=> {
      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash)=> {
        this.setState({loading: false})
      })
    })
  }

  unStakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.tokenFarm.methods.unStakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash)=> {
        this.setState({loading: false})
      })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      // Smart Contracts
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      // Balances
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      // 
      loading: true
    }
  }

  render() {

    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center"> Loading... </p>
    } else {
      content = <Main 
        daiTokenBalance = {this.state.daiTokenBalance}
        dappTokenBalance = {this.state.dappTokenBalance}
        stakingBalance = {this.state.stakingBalance}
        stakeTokens = {this.stakeTokens}
        unStakeTokens = {this.unStakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
