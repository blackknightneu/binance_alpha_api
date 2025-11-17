import mongoose from 'mongoose'

const dataSchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true,
    unique: true,  // Đảm bảo apiKey là duy nhất
    index: true
  },
  bodyData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true,
  collection: 'data'  // Tên collection tùy chỉnh
})

export const Data = mongoose.model('Data', dataSchema)
