import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@auth0/auth0-angular';
import { Icategory } from 'src/app/Models/Icategory';
import { PublishProduct } from 'src/app/Models/Ipublish';
import { GategoryService } from 'src/app/Service/gategory.service';
import { PublishstoreService } from 'src/app/Service/publishstore.service';
import { StoreService } from 'src/app/Service/store.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  constructor(
    private gat: GategoryService,
    private fb: FormBuilder,
    private publishstore: PublishstoreService,
    private snakeBar: MatSnackBar,
    private store: StoreService,
    private auth: AuthService,
    private http: HttpClient
  ) {}
  errMsg: string = '';
  gatlist: Icategory[] = [];
  public progress?: any;
  public message?: string;

  ordersForm: FormGroup = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(25)],
    ],
    description: ['', [Validators.required]],
    image: ['', [Validators.required]],
    price: [0, [Validators.required]],
    saleValue: [0],
    quantity: [1, Validators.required],
    preparationDays: ['', Validators.required],
    categoryID: ['', Validators.required],
    storeID: [''],
  });
  ngOnInit(): void {
    this.gat.getAllGatogaries().subscribe((gatilist) => {
      this.gatlist = gatilist;
    });
    this.auth.user$.subscribe((prof) => {
      this.ff['storeID'].setValue(prof?.sub);
    });
  }

  get ff() {
    return this.ordersForm.controls;
  }

  uploadfile(files: any) {
    // console.log(this.ff['image'].value);
    if (files.length === 0) {
      return;
    }
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    this.http
      .post('https://handmadeapi.azurewebsites.net/upload', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress)
          this.progress = Math.round(
            (100 * event.loaded) / (event.total || 1000)
          );
        else if (event.type === HttpEventType.Response) {
          this.message = 'Upload success.';
          //this.onUploadFinished.emit(event.body);
          // console.log(event.body);
          let btata = JSON.stringify(event.body);
          // console.log(btata);
          let any = btata.slice(13, 89);

          // console.log(any);

          this.ff['image'].setValue(any);
        }
      });
  }

  submitForm() {
    // console.log(this.ordersForm);

    this.store.AddProduct(this.ordersForm.value as PublishProduct);
    this.snakeBar.open('Added', '', {
      duration: 1000,
      panelClass: ['bg-success', 'text-center'],
    });
  }
  register_validation_messages = {
    Name: [{ type: 'required', message: 'your ptoduct Name is required' }],
    Description: [
      { type: 'required', message: 'Description of your product is required' },
    ],

    image: [
      { type: 'required', message: 'your image must be in (jpeg | png | jpg)' },
    ],
    price: [{ type: 'required', message: 'add your product price' }],
    Quantity: [
      {
        type: 'required',
        message:
          'you must tell us  how many Quantity do you have for your product',
      },
    ],
    PreparationDays: [
      {
        type: 'required',
        message:
          'you must tell us  how many days prepair your product for the client',
      },
    ],
    Category: [
      {
        type: 'required',
        message: 'you must choice Category to publish your product there ',
      },
    ],
  };
}
