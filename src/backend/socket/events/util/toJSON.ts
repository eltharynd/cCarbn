import { HelixUser } from '@twurple/api/lib'
import { getRawData } from '@twurple/common'
import { IUserInfo } from '../../../messages/categories/storeable'

export const toJSON = (event: any): any => {
  return getRawData(event)
}

export const getUserInfo = async (user: HelixUser): Promise<IUserInfo> => {

  return null
}