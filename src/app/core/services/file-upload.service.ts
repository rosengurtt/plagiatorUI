import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {

  private progress$: Observable<any>;

  private progress = 0;

  private progressObserver: any;

  constructor() {
    this.progress$ = new Observable(observer => {
      this.progressObserver = observer;
    });
  }

  public getObserver(): Observable<number> {
    return this.progress$;
  }


  public upload(url: string, file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData();
      const xhr: XMLHttpRequest = new XMLHttpRequest();

      formData.append('musicFile', file, file.name);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log(xhr.response);
            resolve(JSON.parse(xhr.response));
          } else {
            console.log(xhr.status)
            reject(xhr.response);
          }
        }
      };

      FileUploadService.setUploadUpdateInterval(500);

      xhr.upload.onprogress = (event) => {
        this.progress = Math.round(event.loaded / event.total * 100);
      };

      xhr.open('POST', url, true);
      xhr.send(formData);
    });
  }

  // tslint:disable-next-line: member-ordering
  private static setUploadUpdateInterval(interval: number): void {
    setInterval(() => { }, interval);
  }
}
