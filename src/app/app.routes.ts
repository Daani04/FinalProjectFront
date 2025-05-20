import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { WarehouseComponent } from './views/warehouse/warehouse.component';
import { GraphicsComponent } from './views/graphics/graphics.component';
import { ProductDataComponent } from './views/product-data/product-data.component';
import { DataUserComponent } from './views/data-user/data-user.component';
import { ChatIAComponent } from './views/chat-ia/chat-ia.component';
import { DataMapComponent } from './views/data-map/data-map.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'warehouse', component: WarehouseComponent },
  { path: 'graphics', component: GraphicsComponent },
  { path: 'product_data/:id', component: ProductDataComponent },
  { path: 'data_user', component: DataUserComponent },
  { path: 'data_map', component: DataMapComponent },
  { path: 'chat_ia', component: ChatIAComponent }
];


export class AppRoutingModule {}
