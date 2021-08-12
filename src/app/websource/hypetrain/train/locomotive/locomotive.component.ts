import { Component, OnInit } from "@angular/core"
import { TrainComponent } from "../train.component"


@Component({
    selector: 'hypetrain-locomotive',
    templateUrl: './locomotive.component.html',
    styleUrls: ['./locomotive.component.scss']
})
export class LocomotiveComponent extends TrainComponent implements OnInit {
    

    async ngOnInit() {
        await super.ngOnInit()
    }
}