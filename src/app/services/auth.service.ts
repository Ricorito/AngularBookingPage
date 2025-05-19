import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";  
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, updateProfile, UserCredential } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { Observable, from, of, BehaviorSubject } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { environment } from "../environments/environment";
import { User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private app = initializeApp(environment.firebase);
  private auth = getAuth(this.app);
  private database = getDatabase(this.app);
  private userSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const storedState = localStorage.getItem('isLoggedIn');
      if (storedState === 'true') {
        this.autoLogin();
      } else {
        this.userSubject.next(null); 
      }
    }

    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        this.getUserData(firebaseUser.uid).subscribe({
          next: (userData) => {
            this.userSubject.next(userData);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('isLoggedIn', 'true'); 
            }
          },
          error: (err) => {
            console.error("Hiba az adatok fetchelése során:", err);
            this.userSubject.next(null);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.removeItem('isLoggedIn'); 
            }
          },
        });
      } else {
        this.userSubject.next(null);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('isLoggedIn'); 
        }
      }
    });
  }

  private autoLogin(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.userSubject.next(JSON.parse(storedUser)); 
      }
    }
  }

  login(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credentials) => {
        const firebaseUser = credentials.user;
        return this.getUserData(firebaseUser.uid).pipe(
          map((userData) => {
            this.userSubject.next(userData);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('isLoggedIn', 'true'); 
              localStorage.setItem('user', JSON.stringify(userData)); 
            }
          })
        );
      })
    );
  }

  logout(): Observable<void> {
    return from(firebaseSignOut(this.auth)).pipe(
      map(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user'); 
        }
      })
    );
  }

  private getUserData(uid: string): Observable<User> {
    const userRef = ref(this.database);
    return from(get(child(userRef, `users/${uid}`))).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val() as User;
        } else {
          throw new Error("A felhasználó nem létezik!");
        }
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user)); 
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => user?.role === "admin"));
  }

  register(email: string, password: string, displayName: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credentials) => {
        const user = credentials.user;

        return from(updateProfile(user, { displayName })).pipe(
          switchMap(() => {
            const userData: User = {
              uid: user.uid,
              email: user.email!,
              displayName,
              role: "user",
            };

            return from(set(ref(this.database, `users/${user.uid}`), userData)).pipe(map(() => credentials));
          })
        );
      })
    );
  }
}
