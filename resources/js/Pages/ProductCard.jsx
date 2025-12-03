import React from "react";
import { Link } from "@inertiajs/react";

export default function ProductCard({ product }) {
  console.log("ProductCard → ingredients :", product.ingredients);

  return (
    <div className="bg-yellow-100 rounded-lg shadow-md p-4 w-[250px] flex flex-col items-center relative">
      {/* Disponibilité */}
      {!product.estDisponible && (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          INDISPONIBLE
        </span>
      )}
      {product.limited && product.estDisponible && (
        <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded uppercase">
          Limited Time
        </span>
      )}

      {/* Image principale */}
      <img
        src={product.imagePrincipale}
        alt={product.nomProduit}
        className="w-[180px] h-[210px] object-contain"
      />

      {/* Informations produit */}
      <h3 className="text-center font-semibold mt-2 text-[#b07643] uppercase">
        {product.nomProduit}
      </h3>
     {/*} {product.familleOlfactive && (
        <p className="text-sm text-gray-600">{product.familleOlfactive}</p>
      )}*/}
      <p className="text-sm font-semibold text-gray-800 mt-1">
        {product.prixProduit} FCFA
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-1">
        {product.contenanceProduit}
      </p>

      {/* Ingrédients */}
      {product.ingredients?.length > 0 && (
        <div className="mt-3 w-full">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Ingrédients clés :</h4>
          <ul className="flex flex-wrap gap-3 justify-center">
            {product.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex flex-col items-center w-16">
                <img
                  src={ingredient.imageIngredient}
                  alt={ingredient.nomIngredient}
                  className="w-12 h-12 object-cover rounded-full border border-gray-300 shadow-sm"
                />
                <span className="text-[10px] text-center mt-1 text-gray-600">
                  {ingredient.nomIngredient}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description */}
      {/*{product.descriptionProduit && (
        <p className="text-xs text-gray-600 text-center line-clamp-3 mt-2">
          {product.descriptionProduit}
        </p>
      )}*/}

      {/* Bouton voir produit */}
      <Link
        href={`/product/${product.id}`}
        className="mt-3 bg-black text-white text-xs font-bold py-2 px-4 rounded hover:bg-gray-800"
      >
        Voir le produit
      </Link>
    </div>
  );
}
