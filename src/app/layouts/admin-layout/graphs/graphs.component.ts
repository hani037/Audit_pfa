import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {test} from '../security-req/test.model';
import * as CanvasJS from '../../../../assets/canvasjs.min';
import * as $ from 'jquery';
import * as jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {AuditService, photo} from "../dashbord/audit.service";
import {screenshot} from "../images/images.component";
import {result} from "../security-req/security-req.component";
import {audit} from "../history/history.component";
import {RequestService} from "../security-req/request.service";
import {score} from "../security-req/score.model";
import {Route, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit {
  private dataURL: string;
  private dataURL2: string;
  private audit:audit;
  private score:score[];
  baseUrl = environment.baseUrl;
  screenshot:photo[];
  private sel=false;
  constructor(@Inject(MAT_DIALOG_DATA) public data:{graph:result[],test:test[],pass:result[],fail:result[]},private requestService:RequestService
              ,private auditService:AuditService,private route:Router) {

  }

  async ngOnInit() {
    this.score = await this.requestService.getscore().toPromise();
    this.score[0].Score= Math.round((this.score[0].Score + Number.EPSILON) * 100) / 100
    this.sel=true;

    //console.log('score'+this.score[0].Score);
    this.screenshot= await this.auditService.get_screenshots().toPromise();
    console.log(this.screenshot)

    this.audit= await this.requestService.getauditbyid().toPromise();
    console.log(this.data.graph)
    console.log(this.screenshot)
    let chart = new CanvasJS.Chart("chartContainer", {
      //animationEnabled: true,
      exportEnabled: true,
      theme:"dark2",
      title: {
        text: "masvs compliance diagram"
      },
      axisY:{
        maximum: 100,
      },
      data: [{
        type: "column",
        dataPoints:
        this.data.graph
      }]
    });
    chart.render();
    let chart2 = new CanvasJS.Chart("chartContainer2", {
      exportEnabled: true,
      theme:"dark2",
      title:{
        text: "Masvs compliance"
      },

      legend: {
        cursor:"pointer",
      },
      toolTip: {
        shared: true,
      },
      axisY: {
        interval: 1
      },
      data: [{
        type: "bar",
        showInLegend: true,
        name: "Pass",
        color: "#f4e6e3",
        dataPoints: this.data.pass
      },
        {
          type: "bar",
          showInLegend: true,
          name: "Fail",
          color: "#FF5733",
          dataPoints:this.data.fail
        }]
    });
    chart2.render();

    let canvas = $("#chartContainer .canvasjs-chart-canvas").get(0);
    this.dataURL = canvas.toDataURL();
    let canvas2 = $("#chartContainer2 .canvasjs-chart-canvas").get(0);
    this.dataURL2 = canvas2.toDataURL();

  }

  async export(){

    let y=40;
    let pdf = new jsPDF();
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    let width = pdf.internal.pageSize.getWidth();
    let height = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(28);
    pdf.setTextColor(6,12,102);
    pdf.text('audit details',83,20);
    pdf.setFontSize(17);

    pdf.setTextColor(0,0,0);
    pdf.text('title: ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.title,28,y);
    y+=15;
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    pdf.text('level: ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.level,30,y);
    y+=15;
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    pdf.text('client name: ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.Client_Name,48,y);
    y+=15;
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    pdf.text('MSTG VERSION: ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.MSTG_VERSION,63,y);
    y+=15;
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    pdf.text('ONLINE MSTG VERSION: ',15,y);
    pdf.setFontSize(11);
    pdf.setTextColor(65,75,206);
    pdf.text(this.audit.ONLINE_MSTG_VERSION,89,y);
    pdf.setTextColor(0,0,0);
    pdf.setFontSize(17);
    y+=15;
    pdf.text('MASVS VERSION:  ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.MASVS_VERSION,66,y);
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    y+=15;
    pdf.text('ONLINE MASVS VERSION:  ',15,y);
    pdf.setFontSize(11);
    pdf.setTextColor(65,75,206);
    pdf.text(this.audit.ONLINE_MASVS_VERSION,90,y);
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    y+=15;
    pdf.text('Email of Tester: ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.Name_Of_Tester,57,y);
    y+=15;
    if (this.audit.Application_Name!==""){
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('Application name: ',15,y);
      pdf.setFontSize(13);
      pdf.setTextColor(42,42,42);
      pdf.text(this.audit.Application_Name,64,y);
      y+=15;
    }
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    pdf.text('Start Date: ',15,y);
    pdf.setFontSize(13);
    pdf.setTextColor(42,42,42);
    pdf.text(this.audit.Start_Date,44,y);
    y+=15;
    if (this.audit.Closing_Date!=="") {
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('Closing Date: ',15,y);
      pdf.setFontSize(13);
      pdf.setTextColor(42,42,42);
      pdf.text(this.audit.Closing_Date,51,y);
      y+=15;

    }
    if (this.audit.Testing_Scope!=="") {
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('Testing Scope: ',15,y);
      pdf.setFontSize(13);
      pdf.setTextColor(42,42,42);
      pdf.text(this.audit.Testing_Scope,56,y);
      y+=15;
    }

    if (this.audit.Filename!=="") {
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('Filename: ',15,y);
      pdf.setFontSize(13);
      pdf.setTextColor(42,42,42);
      pdf.text(this.audit.Filename,42,y);
      y+=15;
    }

    if (this.audit.Google_PlayStore_Link!=="") {
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('Google PlayStore Link: ',15,y);
      pdf.setFontSize(11);
      pdf.setTextColor(65,75,206);
      pdf.text(this.audit.Google_PlayStore_Link,77,y);
      y+=15;
    }

    if (this.audit.Version!=="") {
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('Version: ',15,y);
      pdf.setFontSize(13);
      pdf.setTextColor(42,42,42);
      pdf.text(this.audit.Version,38,y);
      y+=15;
    }

    if (this.audit.SHA256_HASH_OF_APK!=="") {
      pdf.setFontSize(17);
      pdf.setTextColor(0,0,0);
      pdf.text('SHA256 HASH OF APK:',15,y);
      pdf.setFontSize(13);
      pdf.setTextColor(42,42,42);
      pdf.text(this.audit.SHA256_HASH_OF_APK,82,y);

    }


    pdf.addPage();
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    pdf.setFontSize(28);
    pdf.setTextColor(6,12,102);
    pdf.text('Summary',93,20);
    pdf.setFontSize(17);
    pdf.setTextColor(0,0,0);
    y=35;
    let family=true;
    for (let i=0;i<this.screenshot.length;i++){
      if (family==false){
        if (this.screenshot[i]._id.family_name!=this.screenshot[i-1]._id.family_name){
          family=true;
        }
      }
      if (y+5 > 295) {
        pdf.addPage();
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
        y = 10;

      }
      if (family==true){
        pdf.text(this.screenshot[i]._id.family_name,15,y);
        y+=10;
        if (this.screenshot[i+1]){
          console.log(i);
          if (this.screenshot[i]._id.family_name==this.screenshot[i+1]._id.family_name){
            console.log('a'+i);
            family=false;
          }
        }

      }

      pdf.text('MSTG-'+this.screenshot[i]._id.family_name+'-'+this.screenshot[i]._id.requ_rank, 20, y);
      y+=10;
      for (let j=0;j<this.screenshot[i].ScreenshotsOfOneRequRes.length;j++){
        if (y+5 > 295) {
          pdf.addPage();
          pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
          y = 10;
        }
        pdf.text(`Screenshot ${j+1}: `+this.screenshot[i].ScreenshotsOfOneRequRes[j].title, 25, y);
        if (y+10 > 295) {
          pdf.addPage();
          pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
          y = 10;
        }else {
          y+=10;
        }
      }
    }
    pdf.addPage();
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    y=35;
    pdf.setFontSize(28);
    pdf.setTextColor(6,12,102);
    pdf.text('Evidences',83,20);
    pdf.setFontSize(17);
    pdf.setTextColor(151,145,233);
    for (let i=0;i<this.screenshot.length;i++){
      if(i==0){

        pdf.text('MSTG-'+this.screenshot[i]._id.family_name+'-'+this.screenshot[i]._id.requ_rank, 85, 30);

      }

      for (let j=0;j<this.screenshot[i].ScreenshotsOfOneRequRes.length;j++) {
        await this.getBase64ImageFromUrl(this.baseUrl  + this.screenshot[i].ScreenshotsOfOneRequRes[j].screenshot)
          .then(result => {


            if (y + 100 > 295) {
              pdf.addPage();
              pdf.setFontSize(17);
              pdf.setTextColor(151,145,233);
              pdf.text('MSTG-'+this.screenshot[i]._id.family_name+'-'+this.screenshot[i]._id.requ_rank, 85, 25);
              pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
              y = 35;

            }

            pdf.addImage(result, 'JPEG', 13, y, width-26, 100);
            y+=110;

            pdf.setFontSize(17);
            pdf.setTextColor(0,0,0);
            pdf.text('title:', 15, y );
            pdf.setFontSize(13);
            pdf.setTextColor(42,42,42);
            pdf.text(this.screenshot[i].ScreenshotsOfOneRequRes[j].title, 51, y );
            y+=12;
            pdf.setFontSize(17);
            pdf.setTextColor(0,0,0);
            pdf.text('description:' , 15, y);
            pdf.setFontSize(13);
            pdf.setTextColor(42,42,42);
            pdf.text( this.screenshot[i].ScreenshotsOfOneRequRes[j].description, 51, y);
            y+=12;
            pdf.setFontSize(17);
            pdf.setTextColor(0,0,0);
            pdf.text('risk:' , 15, y);
            pdf.setFontSize(13);
            pdf.setTextColor(42,42,42);
            pdf.text(this.screenshot[i].ScreenshotsOfOneRequRes[j].risk, 51, y);
            y+=12;
            for (let k=0;k<this.screenshot[i].ScreenshotsOfOneRequRes[j].tools.length;k++){
              let h=k+1;
              pdf.setFontSize(17);
              pdf.setTextColor(0,0,0);
              pdf.text('tools '+h+':' , 15, y);
              pdf.setFontSize(13);
              pdf.setTextColor(42,42,42);
              pdf.text( this.screenshot[i].ScreenshotsOfOneRequRes[j].tools[k], 51, y);
              y+=12;
            }
            for (let k=0;k<this.screenshot[i].ScreenshotsOfOneRequRes[j].systems.length;k++){
              let h=k+1;
              pdf.setFontSize(17);
              pdf.setTextColor(0,0,0);
              pdf.text('systems '+h+':', 15, y);
              pdf.setFontSize(13);
              pdf.setTextColor(42,42,42);
              pdf.text(this.screenshot[i].ScreenshotsOfOneRequRes[j].systems[k], 51, y);
              y+=12;
            }

            for (let k=0;k<this.screenshot[i].ScreenshotsOfOneRequRes[j].references.length;k++) {
              let h=k+1;
              pdf.setFontSize(17);
              pdf.setTextColor(0,0,0);
              pdf.text('references '+h+':' , 15, y);
              pdf.setFontSize(13);
              pdf.setTextColor(42,42,42);
              pdf.text(this.screenshot[i].ScreenshotsOfOneRequRes[j].references[k], 51, y);
              y+=12;

            }
             pdf.setFontSize(17);
            pdf.setTextColor(0,0,0);
            pdf.text('remediation:' , 15, y);
            pdf.setFontSize(13);
            pdf.setTextColor(42,42,42);
            pdf.text(this.screenshot[i].ScreenshotsOfOneRequRes[j].remedation, 51, y);


          })
          .catch(err => console.error(err));
      }
      y+=20;
      pdf.setFontSize(20);
      pdf.setTextColor(8,40,240);
      pdf.text('Conclusion:',15,y);
      pdf.setFontSize(18);
      pdf.setTextColor(25,31,104);
      pdf.text(this.screenshot[i]._id.requRes_comment,52,y)
      pdf.setFontSize(17);
      pdf.setTextColor(151,145,233);
    }
    pdf.addPage();
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    pdf.addImage(this.dataURL,'JPEG', 20, 20,width-40,(height/2)-50);
    pdf.addImage(this.dataURL2,'JPEG', 20, (height/2)-10,width-40,(height/2)-50);
    let head = [['', 'P', 'F', 'N/A','%']];
    let body = [];
    for (let i=0;i<this.data.test.length;i++){
      body.push(['V'+this.data.test[i]._id.family_rank+':'+this.data.test[i]._id.family_description,this.data.test[i].pass,
        this.data.test[i].fail,this.data.test[i].n_a,this.data.test[i].percentage])
    }
    pdf.addPage();
    pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10, 'S');
    pdf.text("masvs compliance table", 65, 20);

    autoTable(pdf,{margin: {top: 30}, head: head, body: body });



    pdf.save('rapport.pdf');

  }
  public async  getBase64ImageFromUrl(imageUrl) {
    let res = await fetch(imageUrl);
    let blob = await res.blob();

    return new Promise((resolve, reject) => {
      let reader  = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }
}
