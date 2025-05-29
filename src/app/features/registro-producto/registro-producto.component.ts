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
  producto: Producto = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: ''
  };

  originalProducto: Producto | null = null;
  modoEdicion = false;

  idVerificadoInvalid = false;
  fechaLiberacionInvalida = false;
  minFechaHoy = new Date().toISOString().split('T')[0];


  mostrarModalCreado = false;
  mostrarModalEditado = false;
  mostrarModalSinCambios = false;
  loading = true;
  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
  const productoRecibido = history.state.producto as Producto;

  if (productoRecibido) {
    this.modoEdicion = true;

    await this.sleep(2000);
    this.producto = { ...productoRecibido };
    this.originalProducto = JSON.parse(JSON.stringify(productoRecibido));
  }

  await this.sleep(2000); 
  this.loading = false;
}


  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    const hoy = new Date().toISOString().split('T')[0];
    const fechaIngresadaStr = this.producto.date_release;
    this.fechaLiberacionInvalida = fechaIngresadaStr < hoy;

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
      const sinCambios = JSON.stringify(this.producto) === JSON.stringify(this.originalProducto);

      if (sinCambios) {
        this.mostrarModalSinCambios = true;
        return;
      }

      this.productService.updateProducto(this.producto.id, this.producto).subscribe(() => {
        this.mostrarModalEditado = true;
      });
    } else {
      this.productService.createProducto(this.producto).subscribe(() => {
        this.mostrarModalCreado = true;
      });
    }
  }

  onReset(): void {
    if (this.modoEdicion) return;

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

  cerrarYVolver(): void {

    this.mostrarModalCreado = false;
    this.mostrarModalEditado = false;
    this.mostrarModalSinCambios = false;


    setTimeout(() => {
      this.loading = true;


      setTimeout(() => {
        this.router.navigate(['']);
      }, 2000);
    }, 0);
  }



  productoFormValido(): boolean {
    return this.producto &&
      !this.fechaLiberacionInvalida &&
      !this.idVerificadoInvalid;
  }
}
