import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Auction from './abis/Auction.json';
import Car from './models/CarModel.js'

const AuctionContractAddress = '0x2Bb8AbE16df39c6D8D1AB16E654B1A1D2815074d';
const emptyAddress = '0x0000000000000000000000000000000000000000';


// display account details
function App() {
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [allBids, setAllBids] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState('');
  const [currentCar, setCurrentCar] = useState(new Car());
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

        // Convert amount from Wei to ether and round to 4 decimals
        setHighestBid(parseFloat(formatEther(bidAmount.toString())).toPrecision(4));
        setHighestBidder(bidder.toLowerCase());
      } catch (e) {
        console.log('error fetching highest bid: ', e);
      }
    }
  }

  async function fetchCurrentCarDetails() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const car = await contract.fetchCurrentCarDetails();
        setCurrentCar(new Car (car.make, car.model, car.year, car.colour)); 
      } catch (e) {
        console.log('error fetching car details: ', e);
      }
    }
  }

  async function fetchMyBid() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        console.log("mybid: ", await account)
        const myBid = await contract.bids(account);
        setMyBid(parseFloat(formatEther(myBid.toString())));
      } catch (e) {
        console.log('error fetching my bid: ', e);
      }
    }
  }

  async function fetchAllBids() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {

      } catch (e) {
        console.log('error fetching all bids: ', e);
      }
    }
  }
 
  async function fetchOwner() {
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      console.log("contract", contract);
      try {
        console.log("setting");
        const owner = await contract.getOwner();
        setIsOwner(owner.toLowerCase() === account);
      } catch (e) {
        console.log('error fetching owner: ', e);
      }
    }
  }

  async function submitBid(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        // user inputs amount in terms of ether, conver tto wei
        const wei = parseEther(amount);
        await contract.makeBid({ value: wei });

        // wait for smart contract to emit LogBid event then update component
        contract.on('LogBid', (_, __) => {
          fetchMyBid();
          fetchHighestBid();
        });
      } catch (e) {
        console.log('error making bid: ', e);
      }
    }
  }

  async function withdraw() {
    console.log("attempting to withdraw");
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      contract.on('LogWithdrawal', (_) => {
        fetchMyBid();
        fetchHighestBid();
      });
      try {
        console.log("inside try");
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
      fetchCurrentCarDetails();
    }
  }, [account]);

  return (
    <div className='container'>
      <div className='text-right'>Connected Account: {account}</div>

      <h1>Defi Car Auction</h1>
      <div>
        Current Car Up for Bidding:
        <div>Make: {currentCar.make}</div>
        <div>Model: {currentCar.model}</div>
        <div>Year: {currentCar.year}</div>
        <div>Colour: {currentCar.colour}</div>
      </div>

      <div className='mt-4'>
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
        <div>You own this auction
          <button onClick={withdraw}>Withdraw</button>
        </div>
      )}
    </div>
  );
}

export default App;
