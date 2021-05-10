import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'

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

                <h1>Stake DAI Tokens</h1>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
