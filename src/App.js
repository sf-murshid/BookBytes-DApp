import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import React from 'react';

// Components
import Navigation from './components/Navigation';
import Section from './components/Section';
import Product from './components/Product';

// ABIs
import EBook from './abis/EBook.json';

// Config
import config from './config.json';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [eBook, seteBook] = useState(null);
  const [Computers, setComputers] = useState(null);
  const [Science, setScience] = useState(null);
  const [Business, setBusiness] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [item, setItem] = useState(false);

  const togglePop = (item) => {
    setItem(item);
    toggle ? setToggle(false) : setToggle(true);
  };

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const account = ethers.getAddress(accounts[0]);
    setAccount(account);

    //connect to blockChain
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();
    console.log(`network: ${network.chainId}`);
    console.log(`network: ${network}`);


    //connect to smart contracts
    const eBook = new ethers.Contract(
      config[network.chainId]['e-book_store'].address,
      EBook,
      provider
    );
    seteBook(eBook);

    //Load Products
    const items = [];

    for (var i = 0; i < 9; i++) {
      const item = await eBook.items(i + 1);
      items.push(item);
      console.log(`Listed item ${item.id}: ${item.name}`);
    }
    const Computers = items.filter((item) => item.category === 'Computers');
    const Science = items.filter((item) => item.category === 'Science');
    const Business = items.filter((item) => item.category === 'Business');
    setComputers(Computers);
    setScience(Science);
    setBusiness(Business);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Welcome to BookBytes</h2>
      {Computers && Science && Business && (
        <>
          <Section
            title={'Computers'}
            items={Computers}
            togglePop={togglePop}
          />
          <Section title={'Science'} items={Science} togglePop={togglePop} />
          <Section title={'Business'} items={Business} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product
          item={item}
          provider={provider}
          account={account}
          eBook={eBook}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
