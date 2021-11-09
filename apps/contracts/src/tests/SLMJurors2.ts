import { ethers } from 'hardhat'
import chai from 'chai'
import { shouldRevert } from './testing'

describe('SLM Jurors', function () {
  let jurors, token, storage, manager
  let disputeAddress
  let owner, account1, account2, account3, account4
  let userId1, userId2, userId3

  before(async () => {
    ;[owner, account1, account2, account3, account4] = await ethers.getSigners()

    const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
    const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
    const TokenFactory = await ethers.getContractFactory('SlmToken')
    const JudgementFactory = await ethers.getContractFactory('SlmJudgement')

    const initialSupply = ethers.utils.parseEther('100000000')
    token = await TokenFactory.deploy('SLMToken', 'SLM', initialSupply, owner.address)
    await token.deployed()
    await token.unlock()

    const defaultAmount = 100
    await token.mint(account1.address, defaultAmount)
    await token.mint(account2.address, defaultAmount)
    await token.mint(account3.address, defaultAmount)

    const unstakePeriod = 1
    const minimumStake = 1
    storage = await StorageFactory.deploy(token.address, unstakePeriod, minimumStake)

    manager = await ManagerFactory.deploy(token.address, storage.address)
    await storage.setStakerManager(manager.address)

    const minJurorCount = 4
    const tieBreakerDuration = 1
    jurors = await JudgementFactory.deploy(
      manager.address,
      minJurorCount,
      tieBreakerDuration,
    )
    await manager.setJudgementContract(jurors.address)

    const stakeAmount = 100
    disputeAddress = token.address

    await token.connect(account2).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(defaultAmount)
    userId2 = 2
    await manager.connect(account2).stake(userId2, 100)
    chai.expect(await token.balanceOf(account2.address)).to.equal(0)

    await token.connect(account1).increaseAllowance(manager.address, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(defaultAmount)
    userId1 = 1
    await manager.connect(account1).stake(userId1, stakeAmount)
    chai.expect(await token.balanceOf(account1.address)).to.equal(0)

    await token.connect(account3).increaseAllowance(manager.address, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(defaultAmount)
    userId3 = 3
    await manager.connect(account3).stake(userId3, 100)
    chai.expect(await token.balanceOf(account3.address)).to.equal(0)

    await shouldRevert(
      jurors.setMinJurorCount(2),
      'Minimum juror count must be greater than 3',
      'Invalid juror count',
    )
    await jurors.setMinJurorCount(3)

    await jurors.setStakerPool()
  })

  it('Checks voting', async function () {
    const endTime = Math.round(new Date().getTime() / 100)
    await jurors.initializeDispute(disputeAddress, 1, endTime)
    const jurorList = await jurors.getJurors(disputeAddress)

    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)

    await jurors.connect(account1).vote(disputeAddress, 1)

    await jurors.voteStatus(disputeAddress)

    const voteResult = await jurors.getVoteResults(disputeAddress)

    chai.expect(voteResult).to.equal(2)
  })

  it('Checks tie breaker timeout default behavior', async function () {
    disputeAddress = jurors.address

    const endTime = Math.round(new Date().getTime() / 100)
    await jurors.initializeDispute(disputeAddress, 1, endTime)
    const jurorList = await jurors.getJurors(disputeAddress)

    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)

    await jurors.connect(account1).vote(disputeAddress, 1)
    await jurors.connect(account2).vote(disputeAddress, 2)

    await jurors.voteStatus(disputeAddress)

    let voteResult = await jurors.getVoteResults(disputeAddress)

    await jurors.setAdminRights(account4.address)

    await jurors.connect(account4).tieBreaker(disputeAddress, false)

    voteResult = await jurors.getVoteResults(disputeAddress)

    chai.expect(voteResult).to.equal(2)
  })

  it('Checks normal tiebreaker situations', async function () {
    disputeAddress = storage.address

    await jurors.setTieBreakerDuration(10)

    const endTime = Math.round(new Date().getTime() / 100)
    await jurors.initializeDispute(disputeAddress, 1, endTime)
    const jurorList = await jurors.getJurors(disputeAddress)

    chai.expect(await jurorList[0]).to.equal(userId2)
    chai.expect(await jurorList[1]).to.equal(userId1)
    chai.expect(await jurorList[2]).to.equal(userId3)

    await jurors.connect(account1).vote(disputeAddress, 1)
    await jurors.connect(account2).vote(disputeAddress, 2)

    await jurors.voteStatus(disputeAddress)

    let voteResult = await jurors.getVoteResults(disputeAddress)

    await jurors.setAdminRights(account4.address)

    await jurors.connect(account4).tieBreaker(disputeAddress, false)

    voteResult = await jurors.getVoteResults(disputeAddress)

    chai.expect(voteResult).to.equal(3)
  })
})
