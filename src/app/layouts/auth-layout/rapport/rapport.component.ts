import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {cvss, RequestService} from "../../admin-layout/security-req/request.service";
import * as jsPDF from 'jspdf'
import * as CanvasJS from '../../../../assets/canvasjs.min';
import * as $ from 'jquery';
import * as html2canvas from 'html2canvas';
import {AuditService, fail_image, photo} from "../../admin-layout/dashbord/audit.service";
import {test} from "../../admin-layout/security-req/test.model";
import {result} from "../../admin-layout/security-req/security-req.component";
import {environment} from "../../../../environments/environment";

export interface audit {
  _id:string,
  level: string,
  title: string,
  user_id: string,
  ONLINE_MASVS_VERSION:string,
  MSTG_VERSION:string,
  ONLINE_MSTG_VERSION:string,
  Client_Name:string,
  Test_location:string,
  Start_Date:string,
  Closing_Date:string,
  Name_Of_Tester:string,
  Testing_Scope:string,
  Application_Name:string,
  Google_PlayStore_Link:string,
  Filename:string,
  Version:string,
  SHA256_HASH_OF_APK:string,
  MASVS_VERSION:string
}
@Component({
  selector: 'app-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.scss']
})
export class RapportComponent implements OnInit {
  private audit:audit;
  dataURL;
  baseUrl = environment.baseUrl;
  cvss:cvss[];
  tests:test[];
  screenshot:fail_image[];
  @ViewChild('hani') element: ElementRef;
  sel=false;
  private score:{Score:number}[];

  constructor(private requestService:RequestService,private auditService:AuditService) { }

  async ngOnInit(){
    this.cvss= await this.requestService.getcvss().toPromise();
    this.tests=await this.requestService.getaudit().toPromise();
    this.audit= await this.requestService.getauditbyid().toPromise();
    this.score = await this.requestService.getscore().toPromise();
    this.score[0].Score= Math.round((this.score[0].Score + Number.EPSILON) * 100) / 100

    let graph:result[]=new Array();


    for (let i=0;i<this.tests.length;i++){
      graph.push({label:'V'+this.tests[i]._id.family_rank,y:parseInt(this.tests[i].percentage.split('%')[0],10)})

    }
    console.log(this.cvss);
    this.screenshot= await this.auditService.get_fail_screenshots().toPromise();
    console.log(this.screenshot);

    this.sel=true;
    if (this.cvss.length>0){
      var chart = new CanvasJS.Chart("chartContainer", {
        exportEnabled: true,
        animationEnabled: true,
        theme:'dark2',
        title: {
          text: "CVSS Diagram"
        },
        legend:{
          cursor: "pointer",
        },
        data: [{
          type: "pie",
          showInLegend: true,
          toolTipContent: "{name}: <strong>{y}</strong>",
          indexLabel: "{name} - {y}",
          dataPoints: [
            { y: this.cvss[0].Low, name: "Low" ,color:'yellow'},
            { y: this.cvss[0].High, name: "high", exploded: true,color: 'red' },
            { y: this.cvss[0].Information, name: "Information",color: 'blue' },
            { y: this.cvss[0].Medium, name: "Medium",color: 'orange' },

          ]
        }]
      });
      chart.render();
    }

    let chart2 = new CanvasJS.Chart("chartContainer2", {
      //animationEnabled: true,
      exportEnabled: true,
      theme:"dark2",

      axisY:{
        maximum: 100,
      },
      data: [{
        type: "column",
        dataPoints:
        graph
      }]
    });
    chart2.render();
  }
  export(){
  }

}
