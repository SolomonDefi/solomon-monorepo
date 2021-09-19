export class UidSingleton {
  counter: number

  constructor() {
    this.counter = 0
  }

  next(): number {
    this.counter += 1
    return this.counter
  }
}

export const uidSingleton = new UidSingleton()
