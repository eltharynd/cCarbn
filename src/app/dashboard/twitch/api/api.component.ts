import { Component } from '@angular/core';
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService } from 'src/app/shared/data.service'
import { EVENT_TYPES, POSITION } from 'src/app/websource/events/events.service'

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent {

  events: any[] = []
  eventTypes = Object.values(EVENT_TYPES)
  conditionTypes = Object.values(ConditionTypes)
  comparisonOperators = Object.values(ComparisonOperators)
  userTypes = Object.values(UserTypes)
  userOperators = Object.values(UserOperators)

  changes = false

  constructor(private data: DataService, private auth: AuthGuard) {
   //TODO LOAD FROM BACKEND 

   this.events.push({
    conditions: [
      new Condition(ConditionTypes.bit, 1, ComparisonOperators.equals)
    ],
    event: {
      name: 'Aliens - Game over',
      type: 'video',
      src: 'assets/clips/Aliens - Game over man.webm',
      position: POSITION.CENTER,
    }
   })
   this.events.push({
    conditions: [
      new Condition(ConditionTypes.bit, 1, ComparisonOperators.greater),
      new Condition(ConditionTypes.bit, 3, ComparisonOperators.lesserEqual)
    ],
    event: {
      name: 'Aliens - That\'s great',
      type: 'video',
      src: 'assets/clips/Aliens - That\'s great.webm',
      position: POSITION.CENTER,
    }
   })
  }

  sendTestEvent(pointerEvent, event) {
    pointerEvent.stopPropagation()

    this.data.send('test', Object.assign(event, {
      userId: this.auth.currentUser?._id
    }))
  }


  addCondition(event) {
    event.conditions.push(
      new Condition(ConditionTypes.bit, 1, ComparisonOperators.equals)
    )
  }

  deleteCondition(event, condition) {
    event.conditions.splice(event.conditions.indexOf(condition), 1)
  }
}



class Condition {
  type: ConditionTypes
  operator: ComparisonOperators|UserOperators = ComparisonOperators.equals
  compared: number|UserTypes

  constructor(type: ConditionTypes, compared: number|UserTypes, operator?: ComparisonOperators|UserOperators) {
    this.type = type
    this.compared = compared
    if(operator) this.operator = operator
    else if(type === ConditionTypes.user)
      this.operator = UserOperators.is
  }

  static fromJSON(json: any) {
    return new Condition(json.type, json.to, json.operator)
  }
}
enum ConditionTypes {
  bit = 'Bits cheered',
  user = 'User',
  redeem = 'Channel redemption'
}

enum ComparisonOperators {
  equals = '=',
  lesser = '<',
  lesserEqual = '<=',
  greater = '>',
  greaterEqual = '<='
}

enum UserTypes {
  mod = 'Mod',
  new = 'New',
  streamer = 'Streamer',
  sub = 'Sub',
  vip = 'VIP'
}
enum UserOperators {
  is = 'is',
  isnt = 'isn\'t',
  istype = 'type is',
  isnttype = 'type isn\'t'
}
