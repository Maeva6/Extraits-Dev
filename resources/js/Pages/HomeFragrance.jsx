import { Link } from "@inertiajs/react";
import React, { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import { useSearchStore } from './store/SearchStore';

export default function HomeFragrance(props) {
  console.log("Produits reçus :", props.products);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [categoryPages, setCategoryPages] = useState({});

  const allProducts = props.products || [];
  const products = allProducts.filter(p => p.senteur?.toLowerCase() === "ambiance");

  console.log("PRODUITS AMBIANCE - ingrédients :", products.map(p => ({
  id: p.id,
  nomProduit: p.nomProduit,
  ingredients: p.ingredients
})));

  const searchQuery = useSearchStore((state) => state.searchQuery);

  const normalize = (str) =>
    (str ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Filtrage identique à BodyPerfume
  const filteredProducts = products.filter((p) =>
    normalize(p.nomProduit).includes(normalize(searchQuery))
  );

  const itemsPerPage = 6;
  const categories = [...new Set(products.map(p => p.categorie?.name))].filter(Boolean);
  const categoriesWithResults = [...new Set(filteredProducts.map(p => p.categorie?.name))].filter(Boolean);

  const handlePageChange = (category, direction, totalPages) => {
    setCategoryPages((prev) => {
      const currentPage = prev[category] || 1;
      let newPage = currentPage + direction;
      newPage = Math.max(1, Math.min(newPage, totalPages));
      return { ...prev, [category]: newPage };
    });
  };

  // Drag & drop (identique)
  const scrollRefs = useRef({});
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const startDrag = (e, category) => {
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollRefs.current[category].offsetLeft;
    scrollLeftRef.current = scrollRefs.current[category].scrollLeft;
  };
  const onDrag = (e, category) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRefs.current[category].offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollRefs.current[category].scrollLeft = scrollLeftRef.current - walk;
  };
  const stopDrag = () => { isDraggingRef.current = false; };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="font-montserrat font-bold pt-28 px-6 py-4 bg-gray-50">

          {/* Aucun résultat */}
          {searchQuery !== "" && filteredProducts.length === 0 && (
            <div className="text-center text-yellow-600 font-semibold py-10">
              Aucun produit ne correspond à votre recherche.
            </div>
          )}

          {/* === RECHERCHE ACTIVE : affichage direct par catégorie (comme BodyPerfume) === */}
          {searchQuery !== "" && categoriesWithResults.length > 0 && (
            categoriesWithResults.map(category => {
              const productsInCategory = filteredProducts
                .filter(p => p.categorie?.name === category)
                .map(p => ({
                  ...p,
                  ingredients: Array.isArray(p.ingredients) ? p.ingredients : []
                }));

              return (
                <div key={category} className="mb-12">
                  <h2 className="text-lg font-bold text-yellow-600 mb-2">{category}</h2>
                  <div className="flex flex-wrap gap-6">
                    {productsInCategory.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* === AFFICHAGE CLASSIQUE (recherche vide) : avec pagination === */}
          {searchQuery === "" && categories.map((category) => {
            const selectedSize = selectedSizes[category] || "";
            const filteredByCategory = products.filter(p => p.categorie?.name === category);
            const filtered = filteredByCategory.filter(
              p => !selectedSize || p.contenanceProduit === selectedSize
            );

            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const currentPage = categoryPages[category] || 1;
            const paginatedProducts = filtered.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            ).map(p => ({
              ...p,
              ingredients: Array.isArray(p.ingredients) ? p.ingredients : []
            }));

            return (
              <div key={category} className="mb-12">
                <h2 className="text-lg font-bold text-yellow-600 mb-2">{category}</h2>

                <div className="flex items-center gap-2 mb-4">
                  <label className="font-medium text-yellow-600">Contenance :</label>
                  <select
                    value={selectedSizes[category] || ""}
                    onChange={(e) => setSelectedSizes(prev => ({ ...prev, [category]: e.target.value }))}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="">Toutes</option>
                    {[...new Set(filteredByCategory.map(p => p.contenanceProduit))].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(category, -1, totalPages)}
                    className="text-yellow-600 disabled:opacity-30"
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft size={20} />
                  </button>

                  <div
                    className="overflow-x-auto cursor-grab active:cursor-grabbing flex-1"
                    ref={el => scrollRefs.current[category] = el}
                    onMouseDown={(e) => startDrag(e, category)}
                    onMouseMove={(e) => onDrag(e, category)}
                    onMouseUp={stopDrag}
                    onMouseLeave={stopDrag}
                  >
                    <div className="flex gap-6 w-max pb-4 select-none">
                      {paginatedProducts.map(product => (
                        <div key={product.id} className="min-w-[150px] sm:min-w-[200px] text-center">
                          <ProductCard product={product} />
                         
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePageChange(category, 1, totalPages)}
                    className="text-yellow-600 disabled:opacity-30"
                    disabled={currentPage === totalPages}
                  >
                    <FaChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <Footer />
      </div>
    </>
  );
}