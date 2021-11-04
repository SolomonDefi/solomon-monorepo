export enum PaymentCreatedEventType {
  unknown = 'unknown',
  preorder = 'payment.preorder.created',
  escrow = 'payment.escrow.created',
  chargeback = 'payment.chargeback.created',
}
