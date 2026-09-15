import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterMovementComponent } from './register-movement.component';

describe('RegisterMovementComponent', () => {
  let component: RegisterMovementComponent;
  let fixture: ComponentFixture<RegisterMovementComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
