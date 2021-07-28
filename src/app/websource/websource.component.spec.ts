import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsourceComponent } from './websource.component';

describe('WebsourceComponent', () => {
  let component: WebsourceComponent;
  let fixture: ComponentFixture<WebsourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebsourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
