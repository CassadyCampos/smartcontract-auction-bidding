import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Auction from './abis/Auction.json';

const emptyAddress = '0x0000000000000000000000000000000000000000';

// display account details
function App() {
  const [account, setAccount] = useState('');

  async function requestAcount() {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(account[0]);
  }
  

  return (
   <div>
     <div>
       <div>Connected Account: {account}</div>
     </div>
   </div>
  );
}

export default App;
