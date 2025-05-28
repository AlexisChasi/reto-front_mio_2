import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Producto } from '../../core/models/producto.interface';

@Component({
  selector: 'app-registro-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-producto.component.html',
  styleUrl: './registro-producto.component.scss'
})
export class RegistroProductoComponent implements OnInit {

  producto = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: ''
  };

  modoEdicion = false;
  idVerificadoInvalid = false;
  fechaLiberacionInvalida = false;
  minFechaHoy = new Date().toISOString().split('T')[0];

  mostrarModal = false; // 👉 Modal de éxito

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productoRecibido = history.state.producto as Producto;
    if (productoRecibido) {
      this.producto = productoRecibido;
      this.modoEdicion = true;
    }
  }

 verificarId(): void {
  if (this.modoEdicion) return; 

  if (this.producto.id.length >= 3 && this.producto.id.length <= 10) {
    this.productService.verificarId(this.producto.id).subscribe(
      (exists) => {
        this.idVerificadoInvalid = exists;
      },
      () => {
        this.idVerificadoInvalid = true;
      }
    );
  } else {
    this.idVerificadoInvalid = false;
  }
}



  onFechaLiberacionChange(): void {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dd = hoy.getDate().toString().padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;
    const fechaIngresadaStr = this.producto.date_release;

    this.fechaLiberacionInvalida = fechaIngresadaStr < hoyStr;

    if (!this.fechaLiberacionInvalida) {
      const fechaRevision = new Date(fechaIngresadaStr);
      fechaRevision.setFullYear(fechaRevision.getFullYear() + 1);
      this.producto.date_revision = fechaRevision.toISOString().split('T')[0];
    } else {
      this.producto.date_revision = '';
    }
  }

  onSubmit(): void {
    if (this.modoEdicion && this.producto.id) {
      const idString = String(this.producto.id);
      this.productService.updateProducto(idString, this.producto).subscribe(() => {
        this.mostrarModal = true; 
      });
    } else {
      this.productService.createProducto(this.producto).subscribe(() => {
        
        this.mostrarModal = true; 
      });
    }
  }

  onReset(): void {
    this.producto = {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: ''
    };
    this.idVerificadoInvalid = false;
  }

  goBack(): void {
    this.router.navigate(['']);
  }

  
  irAlFormularioPrincipal(): void {
    this.mostrarModal = false;
    this.router.navigate(['']);
  }

  

  productoFormValido(): boolean {
    return this.producto &&
           !this.fechaLiberacionInvalida &&
           !this.idVerificadoInvalid;
  }
}
