import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Auction from './abis/Auction.json';

const AuctionContractAddress = '0xb6BE48C00f802c4Ab5E24Df4DCfE8306508fDB1c';
const emptyAddress = '0x0000000000000000000000000000000000000000';


// display account details
function App() {
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState('');
 
  async function initializeProvider() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(AuctionContractAddress, Auction.abi, signer);
  }

  async function requestAccount() {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(account[0]);
  }
  
  async function fetchHighestBid() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const highestBid = await contract.fetchHighestBid();
        const { bidAmount, bidder } = highestBid;

        // Convert ammount from Wei to ether and round to 4 decimals
        setHighestBid(parseFloat(formatEther(bidAmount.toString())).toPrecision(4));
        setHighestBidder(bidder.toLowerCase());
      } catch (e) {
        console.log('error fetching highest bid: ', e);
      }
    }
  }

  async function fetchMyBid() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        // // const myBid = await contract.bids(account);
        console.log("mybid: ", await account)
        const testAmount = await contract.bids(account);
        console.log("mbidammount:", testAmount )
        // console.log("myBid: ", await contract.bids(account));
        const myBid = 4000000000000000000;
        // setMyBid(parseFloat(formatEther(myBid.toString())).toPrecision(4));
        setMyBid(parseFloat(formatEther(myBid.toString())));
      } catch (e) {
        console.log('error fetching my bid: ', e);
      }
    }
  }
 
  async function fetchOwner() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const owner = await contract.getOwner();
        setIsOwner(owner.toLowerCase() === account);
      } catch (e) {
        console.log('error fetching owner: ', e);
      }
    }
  }

  async function submitBid(event) {
    event.preventDefault();
    console.log("here");
    if (typeof window.ethereum !== 'undefined') {
      console.log("inside if");
      const contract = await initializeProvider();
      try {
        // user inputs amount in terms of ether, conver tto wei
        const wei = parseEther(amount);
        await contract.makeBid({ value: wei });

        // wait for smart contract to emit LogBid event then update component
        contract.on('LogBid', (_, __) => {
          fetchMyBid();
          console.log("inside");
          fetchHighestBid();
        });
        console.log("sent");
      } catch (e) {
        console.log('error making bid: ', e);
      }
    }
  }

  async function withdraw() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      contract.on('LogWithdrawal', (_) => {
        fetchMyBid();
        fetchHighestBid();
      });
      try {
        await contract.withdraw();
      } catch (e) {
        console.log('error withdrawing fund: ', e);
      }
    }
  }

  // request account
  useEffect(() => {
    requestAccount();
  }, []);

  useEffect(() => {
    if (account) {
      fetchOwner();
      fetchMyBid();
      fetchHighestBid();
    }
  }, [account]);

  return (
    <div>
      <div>
        <div>Connected Account: {account}</div>
        <div>My Bid: {myBid} ETH</div>
        <div>Auction Highest Bid Amount: {highestBid}</div>
        <div>
          Auction Highest Bidder: {' '}
          {highestBidder === emptyAddress
            ? 'null'
            : highestBidder === account
              ? 'Me'
              : highestBidder}
        </div>
      </div>

      {!isOwner ? (
        <form onSubmit={submitBid}>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            name="Bid Amount"
            type="number"
            placeholder="Enter Bid Amount"
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
