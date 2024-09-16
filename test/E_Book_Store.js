const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
};

//Global constant of an listing item
const Id = 1;
const Name = 'Learning Go';
const Category = 'Computers';
const Image =
  'https://image.ebooks.com/cover/211190367.jpg?width=166&height=250&quality=85';
const Cost = tokens(1);
const Rating = 4;
const Stock = 5;

describe('E_Book_Store', () => {
  let eBook;
  let deployer, buyer;

  beforeEach(async () => {
    //Setup Accounts
    [deployer, buyer] = await ethers.getSigners();

    //Deploy Contract
    const Ebook = await ethers.getContractFactory('E_Book_Store');
    eBook = await Ebook.deploy();
  });

  describe('Deployment', () => {
    it('Setup the owner', async () => {
      expect(await eBook.owner()).to.equal(deployer.address);
    });

    it('has a name', async () => {
      expect(await eBook.name()).to.equal('E_Book_Store');
    });
  });

  describe('Listing', () => {
    let transaction;
    beforeEach(async () => {
      transaction = await eBook
        .connect(deployer)
        .list(Id, Name, Category, Image, Cost, Rating, Stock);
      await transaction.wait();
    });

    it('Returns item attributes', async () => {
      const item = await eBook.items(Id);
      expect(await item.id).to.equal(Id);
      expect(await item.name).to.equal(Name);
      expect(await item.category).to.equal(Category);
      expect(await item.image).to.equal(Image);
      expect(await item.cost).to.equal(Cost);
      expect(await item.rating).to.equal(Rating);
      expect(await item.stock).to.equal(Stock);
    });

    it('Emit List Event', () => {
      expect(transaction).to.emit(eBook, 'List');
    });
  });

  describe('Buying', () => {
    let transaction;

    beforeEach(async () => {
      // List a item
      transaction = await eBook
        .connect(deployer)
        .list(Id, Name, Category, Image, Cost, Rating, Stock);
      await transaction.wait();

      // Buy a item
      transaction = await eBook.connect(buyer).buy(Id, { value: Cost });
      await transaction.wait();
    });

    it("Updates buyer's order count", async () => {
      const result = await eBook.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it('Adds the order', async () => {
      const order = await eBook.orders(buyer.address, 1);

      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(Name);
    });

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(eBook);
      expect(result).to.equal(Cost);
    });

    it('Emits Buy event', () => {
      expect(transaction).to.emit(eBook, 'Buy');
    });
  });

  describe('Withdrawing', () => {
    let balanceBefore;

    beforeEach(async () => {
      // List a item
      let transaction = await eBook
        .connect(deployer)
        .list(Id, Name, Category, Image, Cost, Rating, Stock);
      await transaction.wait();

      // Buy a item
      transaction = await eBook.connect(buyer).buy(Id, { value: Cost });
      await transaction.wait();

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      // Withdraw
      transaction = await eBook.connect(deployer).withdraw();
      await transaction.wait();
    });

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(eBook);
      expect(result).to.equal(0);
    });
  });
});
