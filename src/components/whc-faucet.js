import React from 'react'
import styled from 'styled-components'

const SERVER = `https://faucet.christroutner.com`

const Well = styled.p`
  background-color: #f5f5f5;
  min-height: 20px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  white-space: pre-line;
`

const WrapperDiv = styled.div`
  padding: 50px;
`

const TxLink = styled.p`
  padding: 25px;
`

type Props = {}
class BchFaucet extends React.PureComponent {
  // constructor to set state and bind "this"
  constructor(props) {
    super(props)
    this.state = {
      outputText: '', // Output of the Well.
      bchAddr: '', // bchAddress provided by user.
      linkAddr: '#', // Link URL to block explorer.
      linkOn: false, // Toggles block explorer link.
      bchBalance: 0, // Initial balance before retreiving form server.
      whcBalance: 0, // Initial balance before retreiving from the server.
    }
  }

  render() {
    const {} = this.props

    if (this.state.whcBalance === 0) this.getBalance()

    return (
      <WrapperDiv>
        <h3>
          This is a <u>testnet</u> faucet Wormhole coins! It is built with{' '}
          <a href="https://developer.bitcoin.com/bitbox">
            BITBOX JavaScript SDK
          </a>{' '}
          and is funded by the{' '}
          <a href="https://www.bitcoin.com/bitcoin-mining">
            Bitcoin.com Mining Pool{' '}
          </a>
          . It currently gives out <u>3 WHC</u>.
        </h3>

        <p>
          Current faucet balance: {this.state.bchBalance} BCH,{' '}
          {this.state.whcBalance} WHC
        </p>

        <p>
          <a href="https://github.com/Bitcoin-com/whc-faucet">
            Fork the code on GitHub!
          </a>
        </p>

        <form>
          <div>
            <label for="bchAddr">BCH Testnet Address: </label>
            <input
              type="text"
              id="bchAddr"
              size="45"
              placeholder="bchtest:qr8d0cp00a07gwf7ltg4ufu48a849j98x5dj7zk423"
              value={this.state.bchAddr}
              onChange={this.handleChange}
            />
          </div>
        </form>

        <button type="button" onClick={this.requestWHC}>
          Get tBCH!
        </button>

        <Well>{this.state.outputText}</Well>

        {this.state.linkOn && (
          <TxLink>
            <a href={this.state.linkAddr} target="_blank">
              View TX on Block Explorer
            </a>
          </TxLink>
        )}

        <p>
          Please send your leftover testnet coins back to the faucet:
          <br />
          <i>bchtest:qr8d0cp00a07gwf7ltg4ufu48a849j98x5dj7zk423</i>
        </p>
      </WrapperDiv>
    )
  }

  // Updates the state as the user updates the input form.
  handleChange = ({ target }) => {
    this.setState({ bchAddr: target.value })
  }

  // Retrieve the wallet balance from the server.
  getBalance = async () => {
    const resp = await fetch(`${SERVER}/tokens/`)
    const body = await resp.json()
    //console.log(`body: ${JSON.stringify(body, null, 2)}`)

    this.setState(prevState => ({
      bchBalance: body.bch,
      whcBalance: body.whc,
    }))
  }

  requestWHC = async () => {
    try {
      //console.log(`state.bchAddr: ${this.state.bchAddr}`)

      this.wipeOutput()

      this.addOutput(`Sending request...`)

      if (this.state.bchAddr === '') {
        this.addOutput(`Error: BCH Address can not be blank`)
        return
      }

      const resp = await fetch(`${SERVER}/tokens/${this.state.bchAddr}`)
      const body = await resp.json()
      console.log(`body: ${JSON.stringify(body, null, 2)}`)

      if (!body.success) {
        const message = body.message

        if (message === `Invalid BCH cash address.`)
          this.addOutput(`Error: Invalid BCH testnet address`)
        else
          this.addOutput(
            `Error: This BCH address has been used before, or you need to wait 24 hours to request from this IP address.`
          )

        return
      }

      this.addOutput(`Success: testnet WHC are on their way!`)
      this.addOutput(`TXID: ${body.txid}`)

      // Show the link to the block explorer.
      this.showLink(body.txid)
    } catch (err) {
      console.log(`Error in requestWHC: `, err)
    }
  }

  showLink(txid) {
    this.setState(prevState => ({
      linkOn: true,
      linkAddr: `https://www.blocktrail.com/tBCC/tx/${txid}`,
    }))
  }

  // Add another line to the output.
  addOutput = str => {
    this.setState(prevState => ({
      outputText: prevState.outputText + `\n${str}`,
    }))
  }

  // Clear the output.
  wipeOutput = () => {
    this.setState(prevState => ({
      outputText: '',
    }))
  }
}

export default BchFaucet
