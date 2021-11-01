import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'
import { stringHelper } from '../helper/stringHelper'

export function IsEthAddress(validationOptions?: ValidationOptions) {
  // turn off @typescript-eslint/ban-types because of object: Object
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEthAddress',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return stringHelper.isEthAddress(value)
        },
      },
    })
  }
}
