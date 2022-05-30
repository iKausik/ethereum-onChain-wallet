import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

/*
 
 Shared Wallet (same as a Joint Bank Account):
   deployer = the deployer of the contract, the owner of the whole wallet(bank).
   account holder = anyone can create an account, account holder will also become an user after opening an account.
   user = only an account holder can add users to his account to give access of deposits and withdrwals.

   NB: 
   1. an account holder can only open one account. 
   2. an user can't open his own account if he/she already associated with an account added by an existing account holder.
   3. only the deployer(owner) can see the total amount of funds available under management in the wallet(bank).
   4. only the deployer(owner) can see a list(array) of all the account holders in the wallet(bank).
 
 */

describe("SharedWallet", () => {
  let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, walletContractFactory: any, walletContract: any

  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();

    walletContractFactory = await ethers.getContractFactory("SharedWallet");
    walletContract = await walletContractFactory.deploy();
    await walletContract.connect(deployer).deployed();

    await walletContract.connect(user1).createAccount();
  })

  it("Test createAccount", async () => {
    // after creating an account the accountHolder will also be an user of that account
    expect(await walletContract.hasAccount(user1.address)).to.equal(true);
    expect(await walletContract.isUser(user1.address)).to.equal(true);
  })

  it("Test addUser", async () => {
    // only an accounHolder should be able to add a user to his account
    expect(await walletContract.connect(user1).addUser(user2.address));
    expect(await walletContract.isUser(user2.address)).to.equal(true);
  })

  it("Test deposit", async () => {
    // only an user should be able to deposit to his account
    expect(await walletContract.connect(user1).deposit({ value: 40000 }));
  })

  it("Test withdraw", async () => {
    await walletContract.connect(user1).addUser(user2.address);
    await walletContract.connect(user1).deposit({ value: 40000 });

    expect(await walletContract.connect(user2).withdraw(user2.address, 10000));
  })

  it("Test getBalance", async () => {
    await walletContract.connect(user1).deposit({ value: 40000 });
    await walletContract.connect(user1).withdraw(user1.address, 10000);

    expect(await walletContract.connect(user1).getBalance()).to.equal(30000);
  })

  it("Test getTotalWalletBalance", async () => {
    await walletContract.connect(user1).deposit({ value: 50000 });
    await walletContract.connect(user1).withdraw(user1.address, 10000);

    // only deployer (owner) should call this function
    expect(await walletContract.connect(deployer).getTotalWalletBalance()).to.equal(40000);
  })

  it("Test getAllAccountHolders", async () => {
    // only deployer (owner) should call this function
    expect(await walletContract.connect(deployer).getAllAccountHolders()).to.eql([user1.address]);
  })
});
