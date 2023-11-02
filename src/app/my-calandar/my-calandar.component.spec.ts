import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCalandarComponent } from './my-calandar.component';

describe('MyCalandarComponent', () => {
  let component: MyCalandarComponent;
  let fixture: ComponentFixture<MyCalandarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyCalandarComponent]
    });
    fixture = TestBed.createComponent(MyCalandarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
