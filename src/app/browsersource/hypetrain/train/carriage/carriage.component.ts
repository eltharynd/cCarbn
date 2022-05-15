import { Component, Input, OnInit } from '@angular/core'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { SettingsService } from 'src/app/shared/settings.service'
import { TrainComponent } from '../train.component'

@Component({
  selector: 'hypetrain-carriage',
  templateUrl: './carriage.component.html',
  styleUrls: ['./carriage.component.scss'],
})
export class CarriageComponent extends TrainComponent implements OnInit {
  @Input() index: number = 0

  constructor(public hypetrain: HypetrainService, public settings: SettingsService) {
    super(hypetrain, settings)
    this.type = 'carriage'
  }

  async ngOnInit() {
    await super.ngOnInit()
  }

  async animationProgress() {
    if (this.entryState.value !== 'entered')
      this.entryState =
        this.entryState.value === 'void'
          ? {
              value: 'entering',
              params: { viewportWidth: this.settings.viewport.width - (this.settings.hypetrain.train[this.type].size.width * (this.hypetrain.currentCarriageScale || 100)) / 100 },
            }
          : this.entryState.value === 'entering'
          ? { value: 'entered' }
          : this.entryState
  }
}
