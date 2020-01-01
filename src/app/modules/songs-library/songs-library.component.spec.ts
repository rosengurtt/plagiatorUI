import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongsLibraryComponent } from './songs-library.component';

describe('SongsLibraryComponent', () => {
  let component: SongsLibraryComponent;
  let fixture: ComponentFixture<SongsLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SongsLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SongsLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
