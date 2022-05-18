import { Component, OnInit } from '@angular/core'
import { DataService } from 'src/app/shared/data.service'
import { Outcomes, PredictionsService } from 'src/app/shared/predictions.service'
import { SettingsService } from 'src/app/shared/settings.service'
@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss'],
})
export class PredictionsComponent implements OnInit {
  outcomes: Outcomes[]
  constructor(public settings: SettingsService, public predictions: PredictionsService, private data: DataService) {}

  async ngOnInit() {
    if (!this.data._userId) return
    if (!this.settings.loaded.closed) await this.settings.loaded.toPromise()
    if (!this.settings.predictions) return

    this.predictions.progressSubject.subscribe((currentPredictions) => {
      if (!this.outcomes) {
        this.outcomes = currentPredictions.outcomes
      } else {
        for (let i = 0; i < this.outcomes.length; i++) {
          this.outcomes[i].style = currentPredictions.outcomes[i].style
          //this.outcomes[i].style['--percentage-' + i] = currentPredictions.outcomes[i].style['--percentage-' + i]
        }
      }
    })
  }
}
