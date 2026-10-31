export default function ProductsLoading() {
 return (
  <div aria-busy="true" aria-live="polite">
   <span className="sr-only">Cargando productos...</span>

   <div className="hidden rounded-lg bg-white p-4 min-[1281px]:block">
    <div className="h-8 animate-pulse rounded-lg bg-cream-200" />
    {Array.from({ length: 6 }, (_, index) => (
     <div
      key={index}
      className="mt-3 h-10 animate-pulse rounded-lg bg-cream-100"
     />
    ))}
   </div>

   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[1281px]:hidden">
    {Array.from({ length: 4 }, (_, index) => (
     <div
      key={index}
      className="h-40 animate-pulse rounded-lg bg-white"
     />
    ))}
   </div>
  </div>
 )
}
