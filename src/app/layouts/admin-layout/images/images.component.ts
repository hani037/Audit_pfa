import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, NgForm, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {RequestService} from '../security-req/request.service';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuditService} from "../dashbord/audit.service";
// tslint:disable-next-line:class-name
export interface screenshot {
  count:number,
  Screenshot:{
    title: string,
    description: string,
    productImage: string,
    _id: string,
    requRes_id: string,
    path: string,
    risk:string,
    cvss:string,
    remedation:string,
    tools:string[],
    systems:string[],
    references:string[],
    request: {
      type: string,
      url: string
    }[]
  }[]
}
export interface image {

    title: string,
    description: string,
    productImage: string,
    _id: string,
    requRes_id: string,
    path: string,
    risk:string,
    cvss:string,
    remedation:string,
    tools:string[],
    systems:string[],
    references:string[],
    request: {
      type: string,
      url: string
    }[]

}
@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {
  is_without_image=false;
  screenshots:screenshot;
  images;
  image:image;
  i=0;
  change_image=false;
  // @ts-ignore
  @ViewChild('myInput')myInputVariable: ElementRef;
  sel: number=0;
  private imageUrl;
  _edit=false;
  references = new FormArray([]);
  system = new FormArray([]);
  tool = new FormArray([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data:{id:string,pass:boolean},private requestService:RequestService
    ,private http:HttpClient,private MatSnack: MatSnackBar,private auditService:AuditService) {
      this.references.push(new FormControl(''));
    this.system.push(new FormControl(''));
    this.tool.push(new FormControl(''));

  }

  async ngOnInit() {
    //console.log(this.data.pass);

    this.screenshots=await this.requestService.get_image(this.data.id).toPromise();
    console.log(this.screenshots);
    this.image=this.screenshots.Screenshot[this.i];
  }

  selectImage(event,file:File) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.images = file;
      console.log(event)

    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = event => {
      this.imageUrl = reader.result;
    };
    this.sel=1;
  }
  selectImage1(event,file:File) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.images = file;
      console.log(event)

    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = event => {
      this.imageUrl = reader.result;
      this.change_image=true;
      const formData = new FormData();
        formData.append('screenshot', this.images);
      this.http.put(`http://localhost:8050/screenshotOnlyImage/${this.image._id}`, formData).subscribe();

    };

  }
  addreference() {
    this.references.push(new FormControl(''));
  }
  addsystem() {
    this.system.push(new FormControl(''));
  }
  addtool() {
    this.tool.push(new FormControl(''));
  }

  reset() {

  }
  public  submit(f: NgForm) {
    console.log('aaa');
    const formData = new FormData();
    formData.append('screenshot', this.images);
    formData.append('title', f.value.title);
    formData.append('description', f.value.description);
    formData.append('requRes_id', this.data.id);
    formData.append('audit_id', this.auditService.get_audit().id);
    formData.append('remedation', f.value.remediation);
    if(f.value.CVSS){
      formData.append('cvss', f.value.CVSS);
    }
    if(f.value.risk){
      formData.append('risk', f.value.risk);
    }else{
      formData.append('risk', '');
    }
    console.log(this.system);
    for (let i=0;i<this.system.length;i++){
      if(this.system.value[i]==''&&i>0){
        continue;
      }else {
        formData.append(`systems[${i}]`, this.system.value[i]);

      }
    }
    for (let i=0;i<this.references.length;i++){
      if(this.references.value[i]==''&&i>0){
        continue;
      }else {
        formData.append(`references[${i}]`, this.references.value[i]);
      }
    }
    for (let i=0;i<this.tool.length;i++){
      if(this.tool.value[i]==''&&i>0){
        continue;
      }else {
        formData.append(`tools[${i}]`, this.tool.value[i]);
      }
    }
    this.http.post('http://localhost:8050/screenshot', formData,
      {responseType: 'text'}).subscribe(async data=>{
        console.log(data);
        f.reset();
        this.reset();
        this.images=null;
      // tslint:disable-next-line:triple-equals
        if(data=='uploaded'){
          this.MatSnack.open( 'uploaded', 'cancel', {
            duration: 1500
          });
        }
      }
    );
  }

  left() {
    if (this.i===0){
      this.i=this.screenshots.Screenshot.length-1;
      this.image=this.screenshots.Screenshot[this.i]
    } else {
      this.i--;
      this.image=this.screenshots.Screenshot[this.i];
    }
  }
  right(){
    if (this.i===this.screenshots.Screenshot.length-1){
      this.i=0;
      this.image=this.screenshots.Screenshot[this.i]
    } else {
      this.i++;
      this.image=this.screenshots.Screenshot[this.i];
    }
  }

  details() {

  }

  edit() {

    for (let i=0;i<this.image.tools.length;i++){
      if(i==0){
        this.tool.controls[i].setValue(this.image.tools[i]);
      }else {
        this.tool.push(new FormControl(this.image.tools[i]));

      }
    }
    for (let i=0;i<this.image.references.length;i++){
      if(i==0){
        this.references.controls[i].setValue(this.image.references[i]);
      }else {
        this.references.push(new FormControl(this.image.references[i]));

      }
    }
    for (let i=0;i<this.image.systems.length;i++){
      if(i==0){
        this.system.controls[i].setValue(this.image.systems[i]);
      }else {
        this.system.push(new FormControl(this.image.systems[i]));

      }
    }
    this.sel=1;
    this._edit=true;
    if (this.image.path){
      this.imageUrl='http://localhost:8050/'+this.image.path;

    }
  }

  submit_edit(f: NgForm) {
    /*const formData = new FormData();
    if(this.change_image==true){
      formData.append('screenshot', this.images);
      formData.append('title', f.value.title);
      formData.append('description', f.value.description);
      formData.append('requRes_id', this.data.id);
      formData.append('audit_id', this.auditService.get_audit().id);
      formData.append('remedation', f.value.remediation);
      formData.append('risk', f.value.risk);
      //console.log(this.system);
      for (let i=0;i<this.system.length;i++){
        formData.append(`systems[${i}]`, this.system.value[i]);
      }
      for (let i=0;i<this.references.length;i++){
        formData.append(`references[${i}]`, this.references.value[i]);
      }
      for (let i=0;i<this.tool.length;i++){
        formData.append(`tools[${i}]`, this.tool.value[i]);
      }
      //console.log(formData);
      this.http.put(`http://localhost:8050/screenshotUpdate/${this.image._id}`, formData,
        {responseType: 'text'}).subscribe(async data=>{
          console.log(data);
          f.reset();
          this.reset();
          this.images=null;
          // tslint:disable-next-line:triple-equals
          if(data=='uploaded'){
            this.MatSnack.open( 'uploaded', 'cancel', {
              duration: 1500
            });
          }
        }
      );
    }else{

      this.http.put(`http://localhost:8050/screenshotUpdate2/${this.image._id}`,
        {
          title:f.value.title,
          description:f.value.description,
          requRes_id: this.data.id,
          audit_id:this.auditService.get_audit().id,
          remedation: f.value.remediation,
          risk: f.value.risk,
          systems: this.system.value,
          references:this.references.value,
           tools:this.tool.value,

        }
        ).subscribe(async data=>{
          console.log(data);
          f.reset();
          this.reset();
          this.images=null;
          // tslint:disable-next-line:triple-equals
          if(data=='uploaded'){
            this.MatSnack.open( 'uploaded', 'cancel', {
              duration: 1500
            });
          }
        }
      );
    }

*/
  }

  delete() {
    if (confirm("Are you sure to delete " + this.image.title)) {
      if(this.image.path){
        this.requestService.delete_screenshot(this.image._id)

      }else {
        this.requestService.delete_noscreenshot(this.image._id)

      }
    }
  }

  without_image() {
    this.is_without_image=true;
    this.sel=1;
  }

  submit_without_image(f: NgForm) {
    let tools = [];
    let systems = [];
    let references = [];
    console.log('aa');
    for (let i = 0; i < this.system.length; i++) {
      if (this.system.value[i] == '' && i > 0) {
        continue;
      } else {
        systems.push(this.system.value[i])

      }
    }
    for (let i = 0; i < this.references.length; i++) {
      if (this.references.value[i] == '' && i > 0) {
        continue;
      } else {
        references.push(this.references.value[i])
      }
    }
    for (let i = 0; i < this.tool.length; i++) {
      if (this.tool.value[i] == '' && i > 0) {
        continue;
      } else {
        tools.push(this.tool.value[i])
      }
      const body={
        title: f.value.title,
        description: f.value.description,
        requRes_id: this.data.id,
        remedation: f.value.remediation,
        risk: f.value.risk,
        systems: systems,
        references: references,
        tools: tools,
        cvss:f.value.CVSS,
        audit_id:this.auditService.get_audit().id

      };

      if(!f.value.CVSS){
        delete body.cvss;
      }

      this.http.post('http://localhost:8050/noscreenshot',body,
        {responseType: 'text'}).subscribe(async data => {
          console.log(data);
          f.reset();
          this.reset();
          this.images = null;
          // tslint:disable-next-line:triple-equals
          if (data == 'uploaded') {
            this.MatSnack.open('uploaded', 'cancel', {
              duration: 1500
            });
          }
        }
      );
    }
  }

  update_title(title: string,id) {
    this.http.put(`http://localhost:8050/screenshotUpdateTitle/${id}`,{title:title}).subscribe();
  }

  update_description(title:string, _id: string) {
    this.http.put(`http://localhost:8050/screenshotUpdateDescription/${_id}`,{description:title}).subscribe();

  }
  update_Remedation(title:string, _id: string) {
    this.http.put(`http://localhost:8050/screenshotUpdateRemedation/${_id}`,{remedation:title}).subscribe();
  }
  update_Risk(title:string, _id: string) {
    this.http.put(`http://localhost:8050/screenshotUpdateRisk/${_id}`,{risk:title}).subscribe();
  }
  update_Cvss(title:string, _id: string) {
    this.http.put(`http://localhost:8050/screenshotUpdateCvss/${_id}`,{cvss:title}).subscribe();
  }
  update_tools(title:string[], _id: string) {
    let tools = [];

    for (let i = 0; i < title.length; i++) {
      if (title[i] == '' && i > 0) {
        continue;
      } else {
        tools.push(title[i])

      }
    }
    this.http.put(`http://localhost:8050/screenshotUpdateTools/${_id}`,{tools:tools}).subscribe();
  }
  update_systems(title:string, _id: string) {
    let systems = [];

    for (let i = 0; i < title.length; i++) {
      if (title[i] == '' && i > 0) {
        continue;
      } else {
        systems.push(title[i])

      }
    }
    this.http.put(`http://localhost:8050/screenshotUpdateSystems/${_id}`,{systems:systems}).subscribe();
  }
  update_references(title:string, _id: string) {
    let reference = [];

    for (let i = 0; i < title.length; i++) {
      if (title[i] == '' && i > 0) {
        continue;
      } else {
        reference.push(title[i])

      }
    }
    this.http.put(`http://localhost:8050/screenshotUpdateReferences/${_id}`,{references:reference}).subscribe();
  }

  delete_only_image(_id: string) {
    if(confirm("Are you sure to delete the image ")) {
      this.imageUrl = null;
      this.http.delete(`http://localhost:8050/screenshotDeleteImage/${_id}`).subscribe();
    }

  }
}
