import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

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
          return /^0x[a-fA-F0-9]{40}$/.test(value)
        },
      },
    })
  }
}
