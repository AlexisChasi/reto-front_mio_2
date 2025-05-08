import { Component, OnInit } from '@angular/core';
import { Producto } from '../../core/models/producto.interface';
import { ProductService } from '../../core/services/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  searchTerm = '';
  pageSize = 5;
  currentPage = 1;

  selectedProducto?: Producto;
  productoSeleccionado: any = null;
  mostrarModal = false;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.productService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: () => alert('Error cargando productos')
    });
  }

  get filtered(): Producto[] {
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) || 
      (p.description && p.description.toLowerCase().includes(term))
    );
  }

  get paginated(): Producto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalResultados(): number {
    return this.filtered.length;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  selectProducto(producto: Producto) {
    this.router.navigate(['/registrar'], { state: { producto } });
  }
  
  agregarProducto(): void {
    this.router.navigate(['/registrar']);
  }

  cargarProductos(): void {
    this.productService.getProductos().subscribe((data) => {
      this.productos = data;
    });
  }
  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProducto(id).subscribe(() => {
        alert('¡Producto eliminado con éxito!');
        this.cargarProductos(); 
      });
    }
  }

  abrirModalEliminar(producto: any): void {
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
