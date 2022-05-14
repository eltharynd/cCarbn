import { Component, Input, OnInit } from '@angular/core'
import { TrainComponent } from '../train.component'

@Component({
  selector: 'hypetrain-carriage',
  templateUrl: './carriage.component.html',
  styleUrls: ['./carriage.component.scss'],
})
export class CarriageComponent extends TrainComponent implements OnInit {
  @Input() index: number = 0

  async ngOnInit() {
    await super.ngOnInit()
  }

  async animationProgress() {
    if (this.entryState.value !== 'entered')
      this.entryState =
        this.entryState.value === 'void'
          ? { value: 'entering', params: { viewportWidth: this.viewport.width - (this.size.width * (this.scale || 100)) / 100 } }
          : this.entryState.value === 'entering'
          ? { value: 'entered' }
          : this.entryState
  }
}
