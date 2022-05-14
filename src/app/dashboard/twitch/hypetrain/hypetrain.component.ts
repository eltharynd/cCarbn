import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { AuthGuard } from 'src/app/auth/auth.guard'
import { DataService } from 'src/app/shared/data.service'
import * as merge from 'deepmerge'
import { NbStepperComponent } from '@nebular/theme'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { SettingsService } from 'src/app/shared/settings.service'

@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
})
export class HypetrainComponent implements OnInit {
  @ViewChild('trainStepper') trainStepper: NbStepperComponent
  steps: any = STEPS

  constructor(private data: DataService, private auth: AuthGuard, public hypetrain: HypetrainService, public settings: SettingsService) {}

  async ngOnInit() {
    let settings = await this.data.get(`user/${this.auth.currentUser?._id}/settings/api/listener/hypetrain`)
    if (!settings) return

    this.hypetrain.onLevelChange.subscribe((level) => this.onLevelChange(level))
    this.hypetrain.onProgress.subscribe(() => this.onProgress())
  }

  async onLevelChange(level: number) {
    this.steps = STEPS
    this.trainStepper.reset()
    if (level > 0) {
      this.steps[0].label = 'Hype Train\nin progress'
      this.trainStepper.next()
      this.steps[level].label = `Level ${level}\nin progress`
    }
    if (this.hypetrain.ending) this.steps[level].label = `Lavel ${level}\nfailed`

    for (let i = 1; i <= level - 1; i++) {
      this.steps[i].label = `Level ${i}\ncompleted`
      this.trainStepper.next()
    }
  }

  async onProgress() {
    if (this.hypetrain.currentLevel === 5 && this.hypetrain.ending) {
      this.steps[5].label = `Lavel 5\ncompleted`
      this.trainStepper.next()
    }
  }

  async startTest() {
    console.log(await this.data.get('hypetrain/test'))
  }
  async stopTest() {
    console.log(await this.data.get('hypetrain/stop'))
  }
}

const STEPS = [
  { label: 'No\nHype Train' },
  { label: 'Level 1' },
  { label: 'Level 2' },
  { label: 'Level 3' },
  { label: 'Level 4' },
  { label: 'Level 5' },
  { label: 'Only to show lvl 5 as completed', hidden: true },
]
