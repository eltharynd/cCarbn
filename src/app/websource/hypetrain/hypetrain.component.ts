import { Component, OnInit, OnDestroy, Input } from '@angular/core';

export const MAX_LEVEL = 6

@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss']
})
export class HypetrainComponent implements OnInit, OnDestroy {

  @Input() currentLevel: number = 1
  @Input() currentVolume: number = 1

  private loops = {}

  constructor() { }

  ngOnInit(): void {
    for(let i=1; i<=6; i++) {
      this.loops[`lvl${i}`] = new Audio()
      this.loops[`lvl${i}`].src = `assets/Hype Train Level ${i} Loop.mp3`
      this.loops[`lvl${i}`].load()
      this.loops[`lvl${i}`].autoplay = true
      this.loops[`lvl${i}`].volume = i===1 ? this.currentVolume : 0
    }
  }

  ngOnDestroy() {
    for(let i=1; i<=6; i++) 
      this.loops[`lvl${i}`].stop()
  }

  onVolumeChange() {
    for(let i=1; i<=6; i++)
      this.loops[`lvl${i}`].volume = this.loops[`lvl${i}`].volume>0 ? this.currentVolume : 0 
  }

  onLevelChange() {
    for(let i=1; i<=6; i++) 
      this.loops[`lvl${i}`].volume = 0
    this.loops[`lvl${Math.min(Math.max(1, this.currentLevel), 6)}`].volume = this.currentVolume
  }

}
