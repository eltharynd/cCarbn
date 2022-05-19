import { CommonModule } from '@angular/common'
import { NgModule, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'channelPointsPipe',
})
export class ChannelPointsPipe implements PipeTransform {
  transform(value: number): string {
    if (value < 1_000) {
      return `${value}`
    } else if (value < 1_000_000) {
      return `${Math.floor(value / 100) / 10}K`
    } else {
      return `${Math.floor(value / 1_000_000)}M`
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [ChannelPointsPipe],
  exports: [ChannelPointsPipe],
})
export class CustomPipesModule {}
