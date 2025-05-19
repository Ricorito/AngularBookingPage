import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./components/navbar/navbar.component"; 
import { TimeDatePipe } from "./costumPipe/time-date.pipe";
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent,TimeDatePipe], 
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "hotel-booking";
  currentTime= new Date();
}
