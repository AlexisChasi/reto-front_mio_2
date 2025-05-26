import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
export class RegistroProductoComponent {

  producto = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: ''
  };
  modoEdicion = false;
  idVerificadoInvalid = false; // Flag para verificación de ID

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const productoRecibido = history.state.producto as Producto;

    if (productoRecibido) {
      this.producto = productoRecibido;
      this.modoEdicion = true;
    }
  }

  // Método para verificar el ID
  verificarId(): void {
    if (this.producto.id.length >= 3 && this.producto.id.length <= 10) {
      this.productService.verificarId(this.producto.id).subscribe(
        (exists) => {
          this.idVerificadoInvalid = exists; // Si existe, se marca como no válido
        },
        (error) => {
          this.idVerificadoInvalid = true; // Si hay un error en la consulta, se asume que el ID no es válido
        }
      );
    } else {
      this.idVerificadoInvalid = false; // Si no cumple el largo, no verificamos
    }
  }

  fechaLiberacionInvalida = false;
fechaRevisionInvalida = false;

validarFechas(): void {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); 

  const fechaLiberacion = new Date(this.producto.date_release);
  fechaLiberacion.setHours(0, 0, 0, 0);

  const fechaRevision = new Date(this.producto.date_revision);
  fechaRevision.setHours(0, 0, 0, 0);

 
  this.fechaLiberacionInvalida = fechaLiberacion.getTime() < hoy.getTime();

 
  const fechaEsperadaRevision = new Date(fechaLiberacion);
  fechaEsperadaRevision.setFullYear(fechaEsperadaRevision.getFullYear() + 1);

  this.fechaRevisionInvalida = fechaRevision.getTime() !== fechaEsperadaRevision.getTime();
}

  onSubmit(): void {
    if (this.modoEdicion && this.producto.id) {
      const idString = String(this.producto.id); // Convertir el ID a cadena
      this.productService.updateProducto(idString, this.producto).subscribe(() => {
        alert('¡Producto actualizado con éxito!');
        this.router.navigate(['']);
      });
    } else {
      this.productService.createProducto(this.producto).subscribe(() => {
        alert('¡Producto creado con éxito!');
        this.router.navigate(['']);
        this.onReset();
      });
    }
  }

  onReset() {
    this.producto = {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: ''
    };
    this.idVerificadoInvalid = false; // Reseteamos la verificación del ID
  }

  goBack() {
    this.router.navigate(['']);
  }
}
