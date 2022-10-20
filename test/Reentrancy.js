const { default: Ethers } = require('@typechain/ethers-v5');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Reentrancy', () => {
    let deployer 
    let bank, attackerContract

    beforeEach(async()=> {
        [deployer, user, attacker] = await ethers.getSigners()

        const Bank = await ethers.getContractFactory('Bank', deployer)
        bank = await Bank.deploy();

        await bank.deposit({value: ethers.utils.parseEther('100')})
        await bank.connect(user).deposit({value: ethers.utils.parseEther('50')})
        
        const Attacker = await ethers.getContractFactory('Attacker', attacker)
        attackerContract = await Attacker.deploy(bank.address);
    })

    describe('faciliates deposits and withdraws', () => {
        it('accepts deposits', async() => {
            const deployerBalance = await bank.balanceOf(deployer.address)
            expect(deployerBalance).to.eq(ethers.utils.parseEther('100'))
        
            const userBalance = await bank.balanceOf(user.address)
            expect(userBalance).to.eq(ethers.utils.parseEther('50'))
        
        })

        it('accepts withdraws', async () => {
            await bank.withdraw()

            const deployerBalance = await bank.balanceOf(deployer.address)
            const userBalance = await bank.balanceOf(user.address)

            expect(deployerBalance).to.equal('0');
            expect(userBalance).to.equal(ethers.utils.parseEther('50'));
        })

        it('alloWs attacker to drain funds form #withdraw()', async() => {
            
            console.log('*** Before ***')
            console.log(`Bank Balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`)
            console.log(`Attacker's Balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)
            
            //Perform Attack
            await attackerContract.attack({ value: ethers.utils.parseEther('10')})


            console.log('*** After ***')
            console.log(`Bank Balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`)
            console.log(`Attacker's Balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)
            
            //Check bank balance has been drained
            expect(await ethers.provider.getBalance(bank.address)).to.eq(0)

        })
    })
})
