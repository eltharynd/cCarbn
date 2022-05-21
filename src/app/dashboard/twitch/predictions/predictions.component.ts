import { Component, OnInit } from '@angular/core'
import { PredictionsService } from 'src/app/shared/predictions.service'
import { SettingsService } from 'src/app/shared/settings.service'

export const TEXT_COLOR_OPTIONS = {
  black: 'Black',
  white: 'White',
  manual: 'Manual',
}

export const TEXT_WEIGHT_OPTIONS = {
  100: 'Thin',
  400: 'Normal',
  700: 'Bold',
  900: 'Extra Bold',
}

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss'],
})
export class PredictionsComponent implements OnInit {
  _colors = TEXT_COLOR_OPTIONS
  _weight = TEXT_WEIGHT_OPTIONS

  constructor(public settings: SettingsService, public predictions: PredictionsService) {}

  ngOnInit(): void {}
}
