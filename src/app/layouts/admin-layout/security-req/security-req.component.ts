import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {InfoComponent} from '../info/info.component';
import {FormBuilder, Validators} from '@angular/forms';
import {GraphsComponent} from '../graphs/graphs.component';
import {PdfService} from './pdf.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuditService} from '../dashbord/audit.service';
import {RequestService} from './request.service';
import {test} from './test.model';
import {ImagesComponent} from '../images/images.component';
import {CommentComponent} from '../comment/comment.component';
export interface result {
  y:number,
  label:string
}
@Component({
  selector: 'app-security-req',
  templateUrl: './security-req.component.html',
  styleUrls: ['./security-req.component.scss']
})
export class SecurityReqComponent implements OnInit {
  isloading=true;
  tests:test[];
  test:test;
  i=0;
  title="V1:ARCH";
  selected_level;
  sel:boolean=false;
  constructor(private dialog:MatDialog,private pdfService:PdfService,
              private router:Router,private MatSnack: MatSnackBar,private requestService:RequestService,
              private auditService:AuditService) {
  }
  async ngOnInit() {
    if (localStorage.getItem('audit')) {
      const storedData =localStorage.getItem('audit');

      const parsedData = JSON.parse(storedData) as {
        level:string
      };
    this.selected_level= parsedData.level;
    this.sel=true;
    }
      this.requestService.dialog_close.subscribe(data=>{

      this.gettest();

    });

    await this.gettest();
    this.requestService.selected_test.subscribe(data=>{
      this.test=this.tests[data];
      this.title='V'+this.tests[data]._id.family_rank+':'+this.tests[data]._id.family_name;
      this.i=data;
    })
  }
  public async gettest(){
    this.tests=await this.requestService.getaudit().toPromise();
    this.test=this.tests[this.i];
    this.title='V'+this.tests[this.i]._id.family_rank+':'+this.tests[this.i]._id.family_name;
    this.isloading=false;
    console.log(this.tests);
  }
  public info(data){
    this.dialog.open(InfoComponent, {
      data: data,
      backdropClass: 'backdropBackground' // This is the "wanted" line
    })
  }


  public submit(){
    let graph:result[]=new Array();
    let Pass:result[]=new Array();
    let Fail:result[]=new Array();

    for (let i=0;i<this.tests.length;i++){
      graph.push({label:'V'+this.tests[i]._id.family_rank,y:parseInt(this.tests[i].percentage.split('%')[0],10)})
      Pass.push({label:'V'+this.tests[i]._id.family_rank,y:this.tests[i].pass})
      Fail.push({label:'V'+this.tests[i]._id.family_rank,y:this.tests[i].fail})

    }
    this.dialog.open(GraphsComponent,{
      data:{graph:graph,test:this.tests,pass:Pass,fail:Fail},
      backdropClass: 'backdropBackground',
      width: '940px'
      // This is the "wanted" line
    });
  }

  rapport() {
    this.pdfService.generatePdf(this.tests);
  }

  public Save() {
    this.MatSnack.open( 'Saved', 'cancel', {
      duration: 1500
    });
  }
  public images(id){
    this.dialog.open(ImagesComponent,{backdropClass: 'backdropBackground', // This is the "wanted" line
      data:{id}});
  }
  public Cancel() {
    this.router.navigate(['/home']);
  }

  change_commentaire(id) {
    this.requestService.get_req(id).subscribe(data=>{
      const comment =data.comment;
      this.dialog.open(CommentComponent,{data:{comment,id},backdropClass: 'backdropBackground' // This is the "wanted" line
      });
    })
  }

  change_pass($event,id) {
    this.requestService.update_pass($event.srcElement.value,id).subscribe(data=>{
      this.gettest();
      this.requestService.ischanged.next("true");
    });
  }

  left() {
    if (this.i===0){
      this.i=this.tests.length-1;
      this.test=this.tests[this.i]
    } else {
      this.i--;
      this.test=this.tests[this.i];
    }
    this.requestService.selected_test.next(this.i);

  }
  right(){
    if (this.i===this.tests.length-1){
      this.i=0;
      this.test=this.tests[this.i]
    } else {
      this.i++;
      this.test=this.tests[this.i];
    }
    this.requestService.selected_test.next(this.i);
  }

  progress(t: number) {
    const a=this.tests[t].n_a+this.tests[t].fail+this.tests[t].pass;
    const b=this.tests[t].fail+this.tests[t].pass;
    return `${b}/${a}`
  }
  percentage(t: number) {
    const a=this.tests[t].n_a+this.tests[t].fail+this.tests[t].pass;
    const b=this.tests[t].fail+this.tests[t].pass;
    return (( b/a)*100);
  }

  close_audit() {
    if(confirm("Are you sure to close the audit ")) {

      this.requestService.close_audit();
    }
  }
}
