import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioControlBarComponent } from './audio-control-bar.component';

describe('AudioControlBarComponent', () => {
  let component: AudioControlBarComponent;
  let fixture: ComponentFixture<AudioControlBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioControlBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
