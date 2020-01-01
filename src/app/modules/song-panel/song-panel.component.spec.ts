import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongPanelComponent } from './song-panel.component';

describe('SongPanelComponent', () => {
  let component: SongPanelComponent;
  let fixture: ComponentFixture<SongPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SongPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SongPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
