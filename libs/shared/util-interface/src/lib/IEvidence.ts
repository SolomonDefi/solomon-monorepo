export interface IEvidence {
  id: string

  title: string
  description: string
  fileUrl: string

  isDeleted: boolean
  createDate: Date
  updateDate: Date
  deleteDate: Date
}
