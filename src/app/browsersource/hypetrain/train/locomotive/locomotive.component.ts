import { Component, Input, OnChanges, OnInit } from '@angular/core'
import { SettingsService } from 'src/app/shared/settings.service'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { TrainComponent } from '../train.component'

@Component({
  selector: 'hypetrain-locomotive',
  templateUrl: './locomotive.component.html',
  styleUrls: ['./locomotive.component.scss'],
})
export class LocomotiveComponent extends TrainComponent implements OnInit, OnChanges {
  constructor(public hypetrain: HypetrainService, public settings: SettingsService) {
    super(hypetrain, settings)
    this.type = 'locomotive'
  }

  carriages
  async ngOnInit() {
    await super.ngOnInit()
    this.carriages = this.hypetrain.carriages
    this.hypetrain.onProgress.subscribe((level) => (this.carriages = this.hypetrain.carriages))
  }

  async ngOnChanges() {
    await super.ngOnChanges()
  }
}
