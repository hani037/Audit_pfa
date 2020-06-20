import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../auth-layout/shared/auth.service";
import {Router} from "@angular/router";
import {from, of, Subject} from "rxjs";
import {concatMap, map, switchMap, tap} from "rxjs/operators";
import {screenshot} from "../images/images.component";
import {audit_1, audit_2} from "./dashbord.component";
import {FormArray} from "@angular/forms";
export interface level {
  _id:string,
  requ:
    {requ_id: string, level: string, requ_rank: number, requ_desctiption:string}[]
}

export interface photo {
  _id:{
    family_name: string,
    family_rank: number,
    family_description: string,
    requ_id: string
    requ_description: string
    requ_rank: 1
    requ_procedure: string[]
    requRes_id: string
    requRes_comment: string
    requRes_pass: boolean },
  ScreenshotsOfOneRequRes:{
    screenshot_id: string,
    title: string,
    description: string
    risk: string,
    remedation: string,
    tools: string[],
    systems: string,
    references: string,
    screenshot: string,
  }[]
}
@Injectable({
  providedIn: 'root'
})

export class AuditService {
  public terminate=new Subject();
  public created=new Subject();
  public created_Audit=new Subject();
  public R_levels:level[]=[];
  public L_levels:level[]=[];
  is_submit =new Subject();
  constructor(private http:HttpClient,private authService:AuthService,private router:Router) { }

  public  async crate_audit(audit_1:audit_1,audit_2:audit_2,
                            representative_name:FormArray,representative_title:FormArray,
                            representative_phone:FormArray,representative_org:FormArray,
                            representative_email:FormArray){

    const user_id=this.authService.user.id;
    let date1=new Date()
    const date=date1.getDate()+"/"+(date1.getMonth()+1)+"/"+date1.getFullYear()
    const audit ={...audit_1, ...audit_2,user_id:user_id,Start_Date:date,MSTG_VERSION:"1.1.3",Name_Of_Tester:this.authService.getemail(),
      MASVS_VERSION:"1.1.4",ONLINE_MSTG_VERSION:"https://github.com/OWASP/owasp-mstg/blob/1.1.3/Document/",ONLINE_MASVS_VERSION:"https://github.com/OWASP/owasp-masvs/blob/1.1.4/Document/"}

    this.http.post<{user_id:string,_id:string,level:string}>

    ('http://localhost:8050/audit',audit).pipe(
      concatMap(data=>{
        console.log(data);
        return  this.save_audit(data._id,data.level,false);
      }),concatMap(data=>{
        return this.getlevels();
      }),concatMap(data=>{
        return this.create();
      }),concatMap(data=> {
        return this.create_rep(representative_name,representative_title,
          representative_phone,representative_org,representative_email)
      })).subscribe(data=>{
      this.created_Audit.next(true)
      this.router.navigate(['security_req']);

    });
  }
  public audit_is_closing(){
    let storedData =localStorage.getItem("audit");
    const parsedData = JSON.parse(storedData) as {
      id: string;
      level: string;
      closing:boolean;
    };
    return parsedData.closing;
  }
  public save_audit(id:string,level:string,close:boolean){
    const data = JSON.stringify({
      id: id,
      level: level,
      closing:close
    });
    localStorage.setItem('audit',data );
    return of(true);
  }
  public get_audit(){
    let storedData =localStorage.getItem("audit");
    if (storedData==null){
      this.router.navigate(['']);
      return null
    }
    return JSON.parse(storedData) as {
      id: string;
      level: string;
      closing:boolean;
    };
  }
  public close_date(){
    this.save_audit(this.get_audit().id,this.get_audit().level,true);
  }
  public async getlevels() {
    const level = this.get_audit().level;
    if (level.split('+')[0] == 'L1' && level.split('+')[1] == 'R') {
      this.L_levels= await this.http.get<level[]>('http://localhost:8050/get_L1').toPromise();
      this.R_levels= await this.http.get<level[]>('http://localhost:8050/get_R').toPromise();
      this.terminate.next(true);
    } else if (level.split('+')[0] == 'L2' && level.split('+')[1] == 'R') {
      this.L_levels= await this.http.get<level[]>('http://localhost:8050/get_L2').toPromise();
      this.R_levels= await this.http.get<level[]>('http://localhost:8050/get_R').toPromise();
      this.terminate.next(true);
    } else if(level.split('+')[0]=='L1') {
      this.L_levels= await this.http.get<level[]>('http://localhost:8050/get_L1').toPromise();
      this.terminate.next(true);
    }else {
      this.R_levels= await this.http.get<level[]>('http://localhost:8050/get_L2').toPromise();
      this.terminate.next(true);
    }
    return this.terminate;
  }
  public create(){
    if (this.R_levels.length>0){
      console.log(this.R_levels);

      this.createR();
      return this.createL();

    }else{
      console.log(this.L_levels);
      return this.createL();
    }

  }
  public async createL(){
    for(let i=0;i<this.L_levels.length;i++){
      for(let j=0;j<this.L_levels[i].requ.length;j++){
        await this.createreq(this.L_levels[i].requ[j].requ_id);
      }
    }
    return this.created.next(true);
  } public createR(){
    for(let i=0;i<this.R_levels.length;i++){
      for(let j=0;j<this.R_levels[i].requ.length;j++){
        this.createreq(this.R_levels[i].requ[j].requ_id);
      }
    }
  }
  public async createreq(id:string) {
    const a= await this.http.post<{}>('http://localhost:8050/requRes',{requ_id:id,audit_id:this.get_audit().id}).toPromise();
  }
  public open_audit(_id,level,close){
    this.save_audit(_id,level,close).subscribe(data=>this.created_Audit.next(true));
    this.router.navigate(['security_req']);
  }
  public  delete_audit(_id){
   return  this.http.get<screenshot>(`http://localhost:8050/screenshotByAudit/${_id}`).pipe(concatMap( data=>{

     console.log(data.Screenshot)
     if (data.Screenshot.length>=1){
        console.log("aa")
       for (let i=0;i<data.Screenshot.length;i++){
          this.http.delete(`http://localhost:8050/screenshotDelete/${data.Screenshot[i]._id}`).subscribe(data=>
          console.log(data));
         }
       }
         this.delete_rep(_id);
        return this.http.delete(`http://localhost:8050/deleteAudit/${_id}`)}));

  }
  public get_screenshots(){
    return  this.http.get<photo[]>(`http://localhost:8050/screenshotGrouped/${this.get_audit().id}`);
  }
  public delete(){
    localStorage.removeItem('audit');
  }
  public create_rep(representative_name:FormArray,representative_title:FormArray,
                    representative_phone:FormArray,representative_org:FormArray,
                    representative_email:FormArray){
    console.log("tt")
    for (let i=0;i<representative_name.length;i++){
      console.log("bb")
      this.http.post<{}>('http://localhost:8050/rep',{name:representative_name.value[i],
        title:representative_title.value[i],phone:representative_phone.value[i],org:representative_org.value[i],
        email:representative_email.value[i],audit_id:this.get_audit().id}).subscribe(data=>{
          console.log("aa")
      });
    }
    return of(true);

}
 public  async delete_rep(id){
   await this.http.delete(`http://localhost:8050/deleteAuditRep/${id}`).toPromise();
}

}
