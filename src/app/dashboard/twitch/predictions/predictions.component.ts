import { Component, OnInit } from '@angular/core'
import { PredictionsService } from 'src/app/shared/predictions.service'
import { SettingsService } from 'src/app/shared/settings.service'

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss'],
})
export class PredictionsComponent implements OnInit {
  constructor(public settings: SettingsService, public predictions: PredictionsService) {}

  ngOnInit(): void {}
}
