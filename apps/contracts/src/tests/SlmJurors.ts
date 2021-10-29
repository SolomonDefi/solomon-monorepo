import { ethers } from 'hardhat'
import chai from 'chai'
import { shouldRevert } from './testing'

describe('SLM Jurors', function () {
  it('Checks selection and storage of jurors', async function () {
    const [owner, account1, account2, account3] = await ethers.getSigners()

    const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
    const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
    const TokenFactory = await ethers.getContractFactory('SlmToken')
    const JudgementFactory = await ethers.getContractFactory('SlmJudgement')

    const initialSupply = ethers.utils.parseEther('100000000')
    const token = await TokenFactory.deploy(
      'SLMToken',
      'SLM',
      initialSupply,
      owner.address,
    )
    await token.deployed()
    await token.unlock()

    const defaultAmount = 100
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

    const minJurorCount = 4
    const jurors = await JudgementFactory.deploy(manager.address, minJurorCount)
    await manager.setJudgementContract(jurors.address)

    const stakeAmount = 100
    const disputeAddress = token.address

    await token.connect(account2).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(defaultAmount)
    const userId2 = 2
    await manager.connect(account2).stake(userId2, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(0)

    await token.connect(account1).increaseAllowance(manager.address, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(defaultAmount)
    const userId1 = 1
    await manager.connect(account1).stake(userId1, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(0)

    await jurors.setStakerPool()
    await shouldRevert(
      jurors.setJurors(disputeAddress),
      'Not enough stakers',
      'Total stakers cannot be less than minimum juror count',
    )

    await token.connect(account3).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    const userId3 = 3
    await manager.connect(account3).stake(userId3, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    await shouldRevert(
      jurors.setMinJurorCount(2),
      'Invalid juror count',
      'Minimum juror count must be greater than 3',
    )
    await jurors.setMinJurorCount(3)

    await jurors.setStakerPool()

    await jurors.setJurors(disputeAddress)
    const jurorList = await jurors.getJurors(disputeAddress)

    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)
  })
})
