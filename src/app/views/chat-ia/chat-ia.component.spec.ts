import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatIAComponent } from './chat-ia.component';

describe('ChatIAComponent', () => {
  let component: ChatIAComponent;
  let fixture: ComponentFixture<ChatIAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatIAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatIAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
