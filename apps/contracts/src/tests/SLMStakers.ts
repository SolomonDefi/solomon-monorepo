import { ethers } from 'hardhat'
import chai from 'chai'
import { shouldRevert, toBN } from './testing'

describe('SLM Stakers', function () {
  it('Payment and withdrawal of rewards', async function () {
    const [owner, account1, account2, account3] = await ethers.getSigners()

    const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
    const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
    const TokenFactory = await ethers.getContractFactory('SlmToken')

    const initialSupply = ethers.utils.parseEther('100000000')
    const token = await TokenFactory.deploy(
      'SLMToken',
      'SLM',
      initialSupply,
      owner.address,
    )
    await token.deployed()
    await token.unlock()

    const defaultAmount = 200
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)

    const unstakePeriod = 1
    const minimumStake = 1
    const storage = await StorageFactory.deploy(
      token.address,
      unstakePeriod,
      minimumStake,
    )

    const manager = await ManagerFactory.deploy(token.address, storage.address)
    await storage.setStakerManager(manager.address)
    await storage.setMinWithdrawalWaitTime(30)

    await token.connect(account2).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(defaultAmount)
    const userId2 = 2
    await manager.connect(account2).stake(userId2, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(100)

    await token.connect(account1).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account1.address)).to.equal(defaultAmount)
    const userId1 = 1
    await manager.connect(account1).stake(userId1, 100)
    chai.expect(await token.balanceOf(account1.address)).to.equal(100)

    await token.connect(account3).increaseAllowance(manager.address, 200)
    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    const userId3 = 3
    await manager.connect(account3).stake(userId3, 200)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    const rewardPercent1 = 20
    await manager.announceReward(rewardPercent1)
    const rewardPercent2 = 30
    await manager.announceReward(rewardPercent2)

    const storageBalance = await token.balanceOf(storage.address)
    const totalStaked = await storage.totalStaked()

    const account1Balance = await token.balanceOf(account1.address)
    await manager.withdrawRewards(account1.address)
    const acc1Stake = 100
    const account1Rewards =
      (acc1Stake * rewardPercent1 * storageBalance) / (totalStaked * 100) +
      (acc1Stake * rewardPercent2 * storageBalance) / (totalStaked * 100)
    let expectedBalance = toBN(account1Balance) + toBN(account1Rewards)
    chai.expect(await token.balanceOf(account1.address)).to.equal(expectedBalance)

    const account3Balance = await token.balanceOf(account3.address)
    await manager.withdrawRewards(account3.address)
    const acc3Stake = 200
    const account3Rewards =
      (acc3Stake * rewardPercent1 * storageBalance) / (totalStaked * 100) +
      (acc3Stake * rewardPercent2 * storageBalance) / (totalStaked * 100)
    expectedBalance = toBN(account3Balance) + toBN(account3Rewards)
    chai.expect(await token.balanceOf(account3.address)).to.equal(expectedBalance)
  })
})
