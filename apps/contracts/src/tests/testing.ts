import assert from 'assert'
import { ethers } from 'hardhat'

// Temporary placeholders for blockchain-utils functions
const toBN = (num) => BigInt(toSafeNumber(num))

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const parseSci = (value) => {
  const eInd = value.indexOf('e')
  if (eInd !== -1) {
    const vals = value.split('e')
    const exp = (vals[1].startsWith('+') ? vals[1].slice(1) : vals[1]) || '0'
    let val = vals[0]
    if (val.length === 0 || Number.isNaN(parseInt(val))) {
      throw Error(`Cannot parse ${value}`)
    }
    const dotInd = val.indexOf('.')
    let addZeros = parseInt(exp)
    val = val.replace('.', '')
    if (dotInd !== -1) {
      addZeros -= val.length - dotInd
      if (addZeros < 0) {
        return `${val.slice(0, addZeros)}.${val.slice(addZeros)}`
      }
    }
    return `${val}${'0'.repeat(addZeros)}`
  }
  return value
}

const toSafeNumber = (value) => parseSci(value.toString())

// End of temporary placeholders

export function assertBN(bn1, bn2, msg) {
  const s1 = toSafeNumber(bn1)
  const s2 = toSafeNumber(bn2)
  assert.strictEqual(s1, s2, `${msg}. ${s1} !== ${s2}`)
}

export async function increaseTime(days, start) {
  const now = new Date(start * 1000)
  const later = addDays(now, days).getTime()
  const time = Math.round((later - now.getTime()) / 1000)
  await ethers.provider.send('evm_increaseTime', [time])
  return start + time
}

export async function assertBalance(Token, address, amount) {
  const balance = await Token.balanceOf(address)
  assertBN(balance, toBN(amount), 'Balance incorrect')
}

export const shouldRevert = async (action, expectedOutput, message) => {
  try {
    await action
    assert.strictEqual(false, true, message)
  } catch (error) {
    assert.ok(
      error.message.includes(expectedOutput),
      `Expected: "${expectedOutput}"\n${message || error.message}`,
    )
  }
}
