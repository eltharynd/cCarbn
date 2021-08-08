
export const toJSON = (event: any): any => {
  let properties = [
    //cheers
    'bits', 'broadcasterDisplayName', 'broadcasterId', 'broadcasterName', 'isAnonymous', 'message', 'userDisplayName', 'userId', 'userName', 
    //hypetrain
    'expiryDate', 'goal', 'id', 'lastContribution', 'progress', 'startDate', 'topContributors', 'total', 'level', 'endDate', 'cooldownEndDate'
  ]

  let json: any = {}
  for(let p of properties) {
    if(event[p])
      json[p] = event[p]
  }
  return JSON.parse(JSON.stringify(json))
}