export interface IUser {
  id: string

  email: string
  password: string
  fullName: string
  ethAddress: string

  isAdmin: boolean
  isDeleted: boolean
  createDate: Date
  updateDate: Date
  deleteDate: Date
}
