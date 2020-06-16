import { Injectable } from '@angular/core';
import {AuditService, photo} from '../dashbord/audit.service';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {test} from './test.model';
import {score} from './score.model';
import {map} from 'rxjs/operators';
import {image, screenshot} from '../images/images.component';
import {AuthService} from "../../auth-layout/shared/auth.service";
import {audit} from "../history/history.component";
export interface cvss {
  High: number,
  Information: number,
  Low: number,
  Medium: number,
  Total: number,
}
@Injectable({
  providedIn: 'root'
})
export class RequestService {
  // tslint:disable-next-line:variable-name
  public dialog_close = new Subject<string>();
  public ischanged = new Subject<string>();

  public selected_test =new Subject<number>()
  constructor(private auditService: AuditService,private http: HttpClient,private authService:AuthService) {
  }

  public getaudit() {
    const id = this.auditService.get_audit().id;
    return this.http.get<test[]>(`http://localhost:8050/requResAudit/${id}`);


  }
  public getscore() {
    const id = this.auditService.get_audit().id;
    return this.http.get<score[]>(`http://localhost:8050/requResAverageAudit/${id}`);


  }
  public getauditbyuser() {
    const id = this.authService.user.id;
    console.log(id);
    return this.http.get<audit[]>(`http://localhost:8050/userAudits/${id}`);

  }public getauditbyid() {
    const id = this.auditService.get_audit().id;
    console.log(id);
    return this.http.get<audit>(`http://localhost:8050/audit/${id}`);

  }
  public getcommentaire(id:string){
    return this.http.get<{_id:string, comment:string,pass: string,requ_id:string,audit_id:string}>
    (`http://localhost:8050/requRes/${id}`).pipe(map(data=>{
      return data.comment
    }));
  }
  public update_pass(value,id){
    console.log(id);
    if (value=="null"){
      value=null;
    }
    return this.http.put<{}>(`http://localhost:8050/updaterequResPass/${id}`,{pass:value});
  }
  public update_comment(value,id){
    console.log(id);
    this.http.put<{}>(`http://localhost:8050/updaterequResComment/${id}`,{comment:value}).subscribe(data=> this.dialog_close.next(value));
  }

  public get_image(id){
    return this.http.get<screenshot>(`http://localhost:8050/screenshotByRequRes/${id}`);

  }
  public get_req(id){
    return this.http.get<{comment:string}>(`http://localhost:8050/requRes/${id}`);

  }
  public navigate(i:number){
    this.selected_test.next(i);
  }

  delete_screenshot(_id: string) {
    return this.http.delete(`http://localhost:8050/screenshotDelete/${_id}`).subscribe();

  }

  close_audit() {
    const id = this.auditService.get_audit().id;
    let date1=new Date()
    const date=date1.getDate()+"/"+(date1.getMonth()+1)+"/"+date1.getFullYear()
     this.http.put<{}>(`http://localhost:8050/updateAudit/${id}`,{Closing_Date:date}).subscribe(date=>{
       this.auditService.close_date();
     });

  }

    delete_noscreenshot(_id: string) {
      return this.http.delete(`http://localhost:8050/deletewithoutscreenshot/${_id}`).subscribe();

    }

  delete_evidences_by_requ(id: any) {
    return  this.http.get<screenshot>(`http://localhost:8050/screenshotByRequRes/${id}`).subscribe(data=>{
    for(let i=0;i<data.Screenshot.length;i++){
      if(!data.Screenshot[i].path){
        this.delete_noscreenshot(data.Screenshot[i]._id)
      }else {
        this.delete_screenshot(data.Screenshot[i]._id)
      }
    }
    });

  }

  getcvss() {
    return this.http.get<cvss[]>(`http://localhost:8050/cvss/${this.auditService.get_audit().id}`);

  }
}
