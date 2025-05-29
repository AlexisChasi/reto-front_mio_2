import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../core/models/producto.interface';
import { ProductService } from '../../core/services/product.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';


@Component({
  standalone: true,
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  searchTerm = '';
  pageSize = 5;
  currentPage = 1;
  productoSeleccionado: Producto | null = null;
  mostrarModal = false;

  constructor(private productService: ProductService, private router: Router) {}
  loading = true;


  ngOnInit(): void {
    this.cargarProductos();
  }

  get filtered(): Producto[] {
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(p =>
      p.name?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)
    );
  }

  get paginated(): Producto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalResultados(): number {
    return this.filtered.length;
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalResultados / this.pageSize);
  }

  paginaAnterior(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  paginaSiguiente(): void {
    if (this.currentPage < this.totalPaginas) this.currentPage++;
  }

  agregarProducto(): void {
    this.router.navigate(['/registrar'],{
    state: {} 
  });

  }

  selectProducto(producto: Producto): void {
    this.router.navigate(['/registrar'], { state: { producto } });
  }

  cargarProductos(): void {
  this.loading = true;

  this.productService.getProductos().pipe(
    delay(2000)
  ).subscribe({
    next: (data) => {
      this.productos = data;
      this.loading = false;
    },
    error: () => {
      alert('Error cargando productos');
      this.loading = false;
    }
  });
}



  abrirModalEliminar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }

  confirmarEliminacion(): void {
    if (this.productoSeleccionado) {
      this.productService.deleteProducto(this.productoSeleccionado.id).subscribe(() => {
        this.cargarProductos();
        this.cerrarModal();
      });
    }
  }
}
