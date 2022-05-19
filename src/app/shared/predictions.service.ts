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

  constructor(private data: DataService, private auth: AuthGuard) {
    this.data.socketIO.on('predictions', (data) => {
      console.log(data)
      if (data.locks_at) data.locks_at = new Date(data.locks_at)

      if (data.type === 'Prediction Begin') {
        for (let o of data.outcomes) {
          o.users = 0
          o.channel_points = 0
          o.color = o.color === 'blue' ? PREDICTIONS_BLUE : o.color === 'pink' ? PREDICTIONS_PINK : o.color
          o.percentage = 0
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
  }

  private async onPredictionProgress(outcomes: Outcomes[]) {
    let totalCP: number = await from(outcomes)
      .pipe(
        map((o) => o.channel_points),
        reduce((acc, curr) => acc + curr, 0)
      )
      .toPromise()
    let highestCP: Outcomes = JSON.parse(JSON.stringify(this.currentPrediction.outcomes)).sort((a, b) => b.channel_points - a.channel_points)[0]

    this.currentPrediction.outcomes = await from(outcomes)
      .pipe(
        map((o) => {
          o.color = o.color === 'blue' ? PREDICTIONS_BLUE : o.color === 'pink' ? PREDICTIONS_PINK : o.color
          o.percentage = Math.max(0, Math.min(o.channel_points / highestCP.channel_points, 1))
          return o
        }),
        toArray()
      )
      .toPromise()

    console.log(this.currentPrediction.outcomes)
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
        { title: 'Hell Yeah!', users: 0, channel_points: 0, color: PREDICTIONS_BLUE, percentage: 0 },
        { title: 'Fuck no!', users: 0, channel_points: 0, color: PREDICTIONS_PINK, percentage: 0 },
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
}
export interface Predictions {
  title: string
  locked?: boolean
  locks_at: Date
  outcomes: Outcomes[]
}
