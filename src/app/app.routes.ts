import { Routes } from '@angular/router';
import { ProductListComponent } from './features/product-list/product-list.component';
import { RegistroProductoComponent } from './features/registro-producto/registro-producto.component';

export const routes: Routes = [
    { path: '', component: ProductListComponent },
    { path: 'registrar', component: RegistroProductoComponent }, 
  ];