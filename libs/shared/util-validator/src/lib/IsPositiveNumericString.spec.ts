import { validateSync } from 'class-validator'
import { IsPositiveNumericString } from './IsPositiveNumericString'

describe('IsPositiveNumericString validator', () => {
  it('with valid prop', async () => {
    class C1 {
      @IsPositiveNumericString()
      num = '123456789'

      @IsPositiveNumericString()
      bigNum = '123456789123456798123456789'

      @IsPositiveNumericString()
      float = '0.123456789'

      @IsPositiveNumericString()
      long = '0.123456789123456798123456789'
    }

    let c1 = new C1()

    expect(validateSync(c1).length).toEqual(0)
  })

  it('with invalid prop', async () => {
    class C1 {
      @IsPositiveNumericString()
      foo = 'foo'

      @IsPositiveNumericString()
      bar = '123bar'

      @IsPositiveNumericString()
      negativeNum = '-123456789'
    }

    let c1 = new C1()

    expect(validateSync(c1).length).toEqual(3)
  })
})
