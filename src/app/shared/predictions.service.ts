import { ComponentFactoryResolver, Injectable } from '@angular/core'
import { from, map, merge, reduce, Subject, toArray } from 'rxjs'
import { AuthGuard } from '../auth/auth.guard'
import { DataService } from './data.service'

export const PREDICTIONS_BLUE = '#387AFF'
export const PREDICTIONS_PINK = '#F5009B'

@Injectable({
  providedIn: 'root',
})
export class PredictionsService {
  currentPrediction: Predictions = null

  beginSubject: Subject<Predictions> = new Subject()
  progressSubject: Subject<Predictions> = new Subject()

  constructor(private data: DataService, private auth: AuthGuard) {
    return

    this.data.socketIO.on('predictions', (data) => {
      console.log(data)
      if (data.locks_at) data.locks_at = new Date(data.locks_at)

      if (data.type === 'Prediction Begin') {
        for (let o of data.outcomes) {
          o.users = 0
          o.channel_points = 0
        }
        this.onPredictionBegin(data)
      }
      if (data.type === 'Prediction Progress') {
        this.onPredictionProgress(data.outcomes)
      }
      if (data.type === 'Prediction Lock') {
        this.onPredictionLock()
      }
      if (data.type === 'Prediction End') {
        this.onPredictionEnd()
      }
    })

    this.data.socketIO.on('predictions-test-begin', (data) => {
      this.onPredictionBegin(data.predictions)
    })
    this.data.socketIO.on('predictions-test-progress', (data) => {
      this.onPredictionProgress(data.predictions.outcomes)
    })
    this.data.socketIO.on('predictions-test-lock', (data) => {
      this.onPredictionLock()
    })
    this.data.socketIO.on('predictions-test-end', (data) => {
      this.onPredictionEnd()
    })
  }

  private onPredictionBegin(predictions: Predictions) {
    this.currentPrediction = predictions
    this.beginSubject.next(this.currentPrediction)
  }

  private async onPredictionProgress(outcomes: Outcomes[]) {
    let totalCP = await from(outcomes)
      .pipe(
        map((o) => o.channel_points),
        reduce((acc, curr) => acc + curr, 0)
      )
      .toPromise()
    let index = 0
    let currentPercentage = 0

    console.log(totalCP)

    this.currentPrediction.outcomes = await from(outcomes)
      .pipe(
        map((o) => {
          let oo = JSON.parse(JSON.stringify(o))
          //console.log(o.color)
          o.color = o.color === 'blue' ? PREDICTIONS_BLUE : o.color === 'pink' ? PREDICTIONS_PINK : o.color
          //console.log(o.percentage, currentPercentage, o.channel_points, totalCP)
          o.percentage = o.channel_points / totalCP + currentPercentage
          //console.log(o.percentage, currentPercentage, o.channel_points, totalCP)
          currentPercentage += o.percentage
          //console.log(o.percentage, currentPercentage, o.channel_points, totalCP)

          let oldPercentage
          if (o.style && o.style[`--percentage-${index}`]) {
            oldPercentage = o.style[`--percentage-${index}`]
          } else {
            oldPercentage = `0%`
          }
          o.style = {}
          o.style[`--percentage-${index}`] = `${o.percentage * 100}%`
          o.style[`--color-${index}`] = o.color
          o.style[`--old-percentage-${index++}`] = oldPercentage

          return o
        }),
        toArray()
      )
      .toPromise()
    console.log(this.currentPrediction.outcomes)

    this.progressSubject.next(this.currentPrediction)
  }

  private onPredictionLock() {
    this.currentPrediction.locked = true
  }

  private onPredictionEnd() {
    this.currentPrediction = null
  }

  predictionBeginTest() {
    this.onPredictionBegin({
      title: 'Will this predictions test be successfull??',
      locks_at: new Date(Date.now() + 60_000),
      outcomes: [
        { title: 'Hell Yeah!', color: 'blue', users: 0, channel_points: 0 },
        { title: 'Fuck no!', color: 'pink', users: 0, channel_points: 0 },
      ],
    })
    this.data.socketIO.emit('predictions-test-begin', {
      userId: this.auth.currentUser?._id || this.data._userId,
      predictions: this.currentPrediction,
    })
  }

  predictionProgressTest(outcomeIndex: number) {
    if (!this.currentPrediction) return

    this.currentPrediction.outcomes[outcomeIndex].users++
    this.currentPrediction.outcomes[outcomeIndex].channel_points += 100
    this.onPredictionProgress(this.currentPrediction.outcomes)
    this.data.socketIO.emit('predictions-test-progress', {
      userId: this.auth.currentUser?._id || this.data._userId,
      predictions: this.currentPrediction,
    })
  }

  predictionLockTest() {
    if (!this.currentPrediction) return

    this.onPredictionLock()
    this.data.socketIO.emit('predictions-test-lock', {
      userId: this.auth.currentUser?._id || this.data._userId,
      predictions: this.currentPrediction,
    })
  }

  predictionEndTest() {
    if (!this.currentPrediction) return

    this.onPredictionEnd()
    this.data.socketIO.emit('predictions-test-end', {
      userId: this.auth.currentUser?._id || this.data._userId,
    })
  }
}

export interface Outcomes {
  title?: string
  color?: string
  users: number
  channel_points: number
  percentage?: number
  style?: any
  oldStyle?: any
}
export interface Predictions {
  title: string
  locked?: boolean
  locks_at: Date
  outcomes: Outcomes[]
}
