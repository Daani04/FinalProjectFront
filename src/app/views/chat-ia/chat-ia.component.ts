import { Component } from '@angular/core';
import { FooterComponent } from "../../component/footer/footer.component";
import { DeepseekComponent } from "../../component/deepseek/deepseek.component";

@Component({
  selector: 'app-chat-ia',
  imports: [FooterComponent, DeepseekComponent],
  templateUrl: './chat-ia.component.html',
  styleUrl: './chat-ia.component.css'
})
export class ChatIAComponent {


}
