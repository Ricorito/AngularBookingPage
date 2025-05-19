import { Injectable } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import { Observable } from "rxjs"
import { AuthService } from "../services/auth.service"
import { map, tap } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAdmin().pipe(
      tap((isAdmin) => {
        if (!isAdmin) {
          this.router.navigate(["/dashboard"])
        }
      }),
      map((isAdmin) => isAdmin), 
    )
  }
}

