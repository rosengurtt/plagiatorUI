import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioButtonsComponent } from './audio-buttons.component';

describe('AudioButtonsComponent', () => {
  let component: AudioButtonsComponent;
  let fixture: ComponentFixture<AudioButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
