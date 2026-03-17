import { Controller, Get, Post } from "elysia-nest";
import type { Product, Category } from "fake-orm";

@Controller("/products")
export class ProductsController {
  @Get()
  findAll(): Promise<Product[]> {
    return null as never;
  }

  @Get("/:id")
  findOne(): Promise<Product | null> {
    return null as never;
  }

  @Get("/:id/category")
  getCategory(): Promise<Category> {
    return null as never;
  }

  @Get("/with-category")
  findWithCategory(): Promise<Array<Product & { category: Category }>> {
    return null as never;
  }
}
