import { ethers } from 'hardhat'
import chai from 'chai'

const { expect } = chai

describe('SLM Chargebacks', function () {
  it('Deploy SLM token', async function () {
    const [owner] = await ethers.getSigners()

    const TokenFactory = await ethers.getContractFactory('SlmToken')
    const ChargebackFactory = await ethers.getContractFactory('SlmChargeback')

    const initialSupply = ethers.utils.parseEther('100000000')
    const token = await TokenFactory.deploy(
      'SLMToken',
      'SLM',
      initialSupply,
      owner.address,
    )
    const chargeback = await ChargebackFactory.deploy()

    // Check token balances are correct
    const ownerBalance = await token.balanceOf(owner.address)
    expect(await token.totalSupply()).to.equal(ownerBalance)
    expect(initialSupply).to.equal(ownerBalance)
  })
})
