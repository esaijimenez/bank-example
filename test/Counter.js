const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", () => {
  let counter;

  beforeEach(async () => {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy("My Counter", 1);
  });

  describe("Deployment", () => {
    it("stores the initial count", async () => {
      expect(await counter.count()).to.equal(1);
    });

    it("stores the initial name", async () => {
      expect(await counter.name()).to.equal("My Counter");
    });
  });

  describe("Counting", () => {
    let transaction;
    
    it("increments the count", async () => {
      transaction = await counter.increment();
      await transaction.wait();

      expect(await counter.count()).to.equal(2);

      transaction = await counter.increment();
      await transaction.wait();

      expect(await counter.count()).to.equal(3);
    });

    it("decrements the count", async () => {
        transaction = await counter.decrement();
        await transaction.wait();
  
        expect(await counter.count()).to.equal(0);
  });
});
});
