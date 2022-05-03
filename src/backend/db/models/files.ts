import { ReadStream } from "fs"
import { Schema, model, Types } from "mongoose"


interface IFileModel {
    findOne(filters: {}): IFile,
    find(filters?: {}): Array<IFile>   
}
interface IFile {
    _id?: Types.ObjectId
    filename: string
    metadata?: {
      userId: Types.ObjectId,
      usages: number
    }
    contentType?: string
    disableMD5?: boolean
    aliases?: Array<string>
    chunkSizeBytes?: number
    start?: number
    end?: number
    revision?: number

    save(): Promise<any>
}
export const fileSchema: Schema = new Schema({
    _id: Types.ObjectId,
    filename: String,
    metadata: {
      userId: Types.ObjectId,
      usages: Number
    },
    contentType: String,
    disableMD5: Boolean,
    aliases: [String],
    chunkSizeBytes: Number,
    start: Number,
    end: Number,
    revision: Number
})
//@ts-ignore
export const File: IFileModel = model<IFile>('Uploads.files', fileSchema)


//@ts-ignore
export interface GridfsModel<T, TQueryHelpers, TMethodsAndOverrides = {}, TVirtuals = {}> extends Mongoose.Model<T, TQueryHelpers, TMethodsAndOverrides, TVirtuals> {
    write(options, readStream, callback: (error, file) => {})
    read(findOne: object): ReadStream
    read(findOne: object, callback: (error, buffer) => void)
    unlink(findOne: object, callback: (error, buffer) => void)
  
    findOne(filters: object): IUpload
    find(filters?: object): Array<IUpload>
}
export interface IUpload {
    _id?: Types.ObjectId
    filename: string
    metadata?: {
      userId: Types.ObjectId,
      usages: number
    }
    contentType?: string
    disableMD5?: boolean
    aliases?: Array<string>
    chunkSizeBytes?: number
    start?: number
    end?: number
    revision?: number
  
    save(): Promise<any>
}