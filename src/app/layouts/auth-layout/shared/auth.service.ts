import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, from, Subject} from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user :User;
  public notification =new Subject<boolean>();
  get userIsAuthenticated() {
    if (this.user){
      return true;
    } return false;

  }
  public getToken(){
    if (this.user){
      return this.user.email;
    }
    return null;
  }
  public getemail(){
    if (this.user){
      return this.user.email;
    }
    return null;
  }

  constructor(private http: HttpClient) {}

  autoLogin() {
    const storedData =localStorage.getItem('authdata');
    if (storedData==null){
      return false;
    }
    const parsedData = JSON.parse(storedData) as {
      userId: string;
      token: string;
      role: string;
      email:string;
    };
    const user = new User(
      parsedData.userId,
      parsedData.token,
      parsedData.email
    );

    this.user = user;
    return true;
  }
  public signup( el: string, pass: string) {
    return this.http.put<{message: string}>('http://localhost:8050/signup', {email: el, password: pass});
  }

  public login(el: string, pass: string) {
    return this.http.post<{userId: string, token: string, message: string,email:string}>('http://localhost:8050/login',
      {email: el, password: pass});
  }

  logout() {
    this.user=null;
    localStorage.removeItem('authdata');
  }

  public setUserData(id, token,email) {
    const user = new User(id, token,email);
    this.user=user;
    this.storeAuthData(
      id, token,email
    );
  }

  private storeAuthData(
    Id: string,
    tokenn: string,
    email:string
  ) {
    const data = JSON.stringify({
      userId: Id,
      token: tokenn,
      email:email
    });
    localStorage.setItem('authdata',data );
    this.notification.next(true);
  }
}
