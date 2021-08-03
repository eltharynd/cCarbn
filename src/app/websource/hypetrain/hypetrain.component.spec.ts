import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HypetrainComponent } from './hypetrain.component';

describe('HypetrainComponent', () => {
  let component: HypetrainComponent;
  let fixture: ComponentFixture<HypetrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HypetrainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HypetrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
