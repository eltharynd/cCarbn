import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSliderModule } from '@angular/material/slider'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatButtonModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatButtonModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSlideToggleModule,
  ]
})
export class SharedMaterialModule { }