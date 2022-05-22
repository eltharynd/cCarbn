import { Component } from '@angular/core'
import { SettingsService } from 'src/app/shared/settings.service'

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
})
export class GlobalComponent {
  constructor(public settings: SettingsService) {}
}
