import { CommonModule, DatePipe } from '@angular/common'
import { NgModule, Inject, LOCALE_ID, Pipe, PipeTransform, Component, Input, OnInit, OnDestroy } from '@angular/core'

@Component({
  selector: 'app-timediff',
  template: "{{timeLeft | date: 'mm:ss'}}",
})
export class TimeDifferenceComponent implements OnInit, OnDestroy {
  @Input() target: Date
  timeLeft

  private handler
  ngOnInit() {
    this.timeLeft = new Date(this.target).getTime() - Date.now()
    this.handler = setInterval(() => {
      this.timeLeft = new Date(this.target).getTime() - Date.now()
    }, 1000)
  }

  ngOnDestroy(): void {
    clearInterval(this.timeLeft)
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [TimeDifferenceComponent],
  exports: [TimeDifferenceComponent],
})
export class TimeDifferenceModule {}
