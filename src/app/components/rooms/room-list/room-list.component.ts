import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatBadgeModule } from "@angular/material/badge";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import {  MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import  { RoomService } from "../../../services/room.service";
import  { AuthService } from "../../../services/auth.service";
import  { Room } from "../../../models/room.model";
import {  Observable, combineLatest, map, startWith } from "rxjs";

@Component({
  selector: "app-room-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: "./room-list.component.html",
  styleUrls: ["./room-list.component.scss"],
})
export class RoomListComponent implements OnInit {
  rooms$!: Observable<Room[]>;
  filteredRooms$!: Observable<Room[]>;
  isAdmin$!: Observable<boolean>;

  searchControl = new FormControl("");
  typeControl = new FormControl("");
  availabilityControl = new FormControl("");

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.rooms$ = this.roomService.getRooms();
    this.isAdmin$ = this.authService.isAdmin();

    this.filteredRooms$ = combineLatest([
      this.rooms$,
      this.searchControl.valueChanges.pipe(startWith("")),
      this.typeControl.valueChanges.pipe(startWith("")),
      this.availabilityControl.valueChanges.pipe(startWith("")),
    ]).pipe(
      map(([rooms, search, type, availability]) => {
        let filtered = rooms;

        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(
            (room) =>
              room.number.toLowerCase().includes(searchLower) ||
              room.description.toLowerCase().includes(searchLower),
          );
        }

        if (type) {
          const typeLower = type.toLowerCase();
          filtered = filtered.filter((room) => {
            const roomTypeLower = room.type.toLowerCase();
            return (typeLower === '' || // Kezeli az "Összes" opciót (üres string)
                    (typeLower === 'single' && roomTypeLower === 'egyágyas') ||
                    (typeLower === 'double' && roomTypeLower === 'kétágyas') ||
                    (typeLower === 'suite' && roomTypeLower === 'lakosztály') ||
                    (typeLower === 'family' && roomTypeLower === 'családi') || // Ha a HTML-ben van ilyen opció
                    (typeLower === 'deluxe' && roomTypeLower === 'deluxe'));
          });
        }

        if (availability !== "") {
          const isAvailable = availability === "true";
          filtered = filtered.filter((room) => room.isAvailable === isAvailable);
        }

        // Konzol naplózás a szűrési folyamatról (debug célokra)
        // console.log('Összes szoba:', rooms);
        // console.log('Keresési feltétel:', search);
        // console.log('Típus szűrő:', type);
        // console.log('Elérhetőség szűrő:', availability);
        // console.log('Szűrt szobák:', filtered);

        return filtered;
      }),
    );
  }

  resetFilters(): void {
    this.searchControl.setValue("");
    this.typeControl.setValue("");
    this.availabilityControl.setValue("");
  }

  deleteRoom(id: string | undefined): void {
    if (id) {
      if (confirm("Biztosan törölni szeretnéd ezt a szobát? Ez a művelet nem visszavonható.")) {
        this.roomService.deleteRoom(id).subscribe({
          next: () => {
            this.snackBar.open("Szoba sikeresen törölve", "Bezárás", { duration: 3000 });
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          },
          error: (error) => {
            this.snackBar.open("Hiba a szoba törlésekor", "Bezárás", { duration: 2000 });
            console.error(error);
          },
        });
      }
    } else {
      console.error('Hibás szoba ID');
    }
  }
}