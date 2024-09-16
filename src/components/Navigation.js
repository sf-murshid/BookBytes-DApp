import { ethers } from 'ethers';

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const account = ethers.getAddress(accounts[0]);
    setAccount(account);
  };

  return (
    <nav>
      <div className='nav__brand'>
        <h1>BookBytes</h1>
      </div>

      <input type='text' className='nav__search' />

      {account ? (
        <button type='button' className='nav__connect'>
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      ) : (
        <button type='button' className='nav__connect' onClick={connectHandler}>
          Connect
        </button>
      )}

      <ul className='nav__links'>
        <li>
          <a href='#Computers'>Computers</a>
        </li>
        <li>
          <a href='#Science'>Science</a>
        </li>
        <li>
          <a href='#Business'>Business</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
