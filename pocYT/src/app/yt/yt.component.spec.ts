import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { YtComponent } from './yt.component';

describe('YtComponent', () => {
  let component: YtComponent;
  let fixture: ComponentFixture<YtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YtComponent ],
      imports: [RouterTestingModule],
      providers: [
        
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // I think the components aren't being created because the
  // TestBed wasn't configured with all the providers they require
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});