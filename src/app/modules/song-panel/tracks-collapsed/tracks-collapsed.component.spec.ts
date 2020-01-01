import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TracksCollapsedComponent } from './tracks-collapsed.component';

describe('TracksCollapsedComponent', () => {
  let component: TracksCollapsedComponent;
  let fixture: ComponentFixture<TracksCollapsedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TracksCollapsedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TracksCollapsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
