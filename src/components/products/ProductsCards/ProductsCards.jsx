import ProductCard from './ProductCard'

export default function ProductsCards({ products }) {
 return (
  <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 content-start gap-3 overflow-y-auto sm:grid-cols-2 min-[1281px]:hidden">
   {products.map((product) => (
    <ProductCard key={product.id} product={product} />
   ))}
  </div>
 )
}
