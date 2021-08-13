import { Component, Input, OnChanges, OnInit } from "@angular/core"
import { TrainComponent } from "../train.component"


@Component({
    selector: 'hypetrain-locomotive',
    templateUrl: './locomotive.component.html',
    styleUrls: ['./locomotive.component.scss']
})
export class LocomotiveComponent extends TrainComponent implements OnInit, OnChanges {
    
    @Input() carriages: any[] = []

    async ngOnInit() {
        await super.ngOnInit()      
    }

    async ngOnChanges() {
        await super.ngOnChanges()      
    }
}