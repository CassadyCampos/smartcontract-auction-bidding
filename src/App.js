import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Auction from './abis/Auction.json';

const AuctionContractAddress = '0x739D1753632afB77a99EE2827509d28a74EEe26d';
const emptyAddress = '0x0000000000000000000000000000000000000000';


// display account details
function App() {
  const [account, setAccount] = useState('');

  async function requestAccount() {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(account[0]);
  }

  // 
  async function intializeProvider() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(AuctionContractAddress, Auction.abi, signer);

  }

  // request account
  useEffect(() => {
    requestAccount();
  }, []);

  return (
    <div>
      <div>
        <div>Connected Account: {account}</div>
      </div>
    </div>
  );
}

export default App;
