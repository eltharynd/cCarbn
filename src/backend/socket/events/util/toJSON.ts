import { getRawData } from '@twurple/common'

export const toJSON = (event: any): any => {
  return getRawData(event)
}