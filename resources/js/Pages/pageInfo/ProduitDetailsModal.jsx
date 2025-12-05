import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { X, Package, Tag, Users, Ruler, DollarSign, Calendar, Archive, CheckCircle, AlertTriangle } from 'lucide-react';

const ProduitDetailsModal = ({ produitId, onClose }) => {
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef();

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchProduitDetails = async () => {
      try {
        const response = await axios.get(`/produits/${produitId}`);
        console.log('Données reçues:', response.data);
        if (response.data.success) {
          setProduit(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Erreur lors de la récupération des détails du produit');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (produitId) {
      fetchProduitDetails();
    }
  }, [produitId]);

  // Configuration du statut de stock
  const getStockConfig = () => {
    const quantite = produit?.quantiteProduit || 0;
    const seuilAlerte = produit?.quantiteAlerte || 10;
    
    if (quantite === 0) {
      return {
        icon: Archive,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Rupture de stock'
      };
    } else if (quantite < seuilAlerte) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Stock faible'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'En stock'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative max-w-md">
          {error}
          <button
            onClick={onClose}
            className="mt-3 bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#C19B2C] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (!produit) {
    return null;
  }

  const stockConfig = getStockConfig();
  const StockIcon = stockConfig.icon;
  const estDisponible = produit.quantiteProduit > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* En-tête élégant - FIXE */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Détails du produit</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="font-semibold">#{produit.id?.toString().padStart(3, '0') || '000'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Ajouté le {formatDate(produit.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Bannière de statut - FIXE */}
        <div className={`${stockConfig.bgColor} ${stockConfig.borderColor} border-y p-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <StockIcon size={24} className={stockConfig.color} />
              <div>
                <h3 className="font-semibold text-gray-900">Statut du stock</h3>
                <p className={`text-sm ${stockConfig.color}`}>{stockConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Package size={20} className="text-gray-600" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                estDisponible ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {estDisponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu principal - SCROLLABLE SANS BARRE VISIBLE */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          <div className="space-y-6">
            
            {/* Cartes d'informations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Carte Informations générales */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Package size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom du produit</p>
                    <p className="font-semibold text-gray-900 text-lg">{produit.nomProduit || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                    <p className="text-gray-900">{produit.categorie || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Famille olfactive</p>
                    <p className="text-gray-900">{produit.familleOlfactive || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {/* Carte Prix et Stock */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <DollarSign size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Prix & Stock</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Prix</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">
                      {produit.prixProduit ? `${produit.prixProduit} FCFA` : 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantité en stock</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{produit.quantiteProduit || 0} unités</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produit.quantiteProduit === 0
                          ? 'bg-red-100 text-red-800'
                          : produit.quantiteProduit < (produit.quantiteAlerte || 10)
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {produit.quantiteProduit === 0 ? 'Rupture' : 
                         produit.quantiteProduit < (produit.quantiteAlerte || 10) ? 'Faible' : 'Bon'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte Caractéristiques */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Tag size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Caractéristiques</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sexe cible</span>
                    <span className="font-semibold">{produit.sexeCible || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Contenance</span>
                    <span className="font-semibold">{produit.contenanceProduit || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Seuil d'alerte</span>
                    <span className="font-semibold">{produit.quantiteAlerte || '10'} unités</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Descriptions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Users size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Descriptions et détails</h3>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {produit.descriptionProduit || 'Aucune description disponible'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Personnalité</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {produit.personnalite || 'Non spécifié'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mode d'utilisation</h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {produit.modeUtilisation || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Particularités</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {produit.particularite || 'Aucune particularité'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Ingrédients */}
            {produit.ingredients && produit.ingredients.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <Ruler size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Ingrédients</h3>
                    <span className="bg-[#D4AF37] text-white px-2 py-1 rounded-full text-sm font-medium">
                      {produit.ingredients.length} ingrédient(s)
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {produit.ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-900">{ingredient.nomIngredient || 'Non spécifié'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section Image */}
            {produit.imagePrincipale && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <Package size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Image du produit</h3>
                  </div>
                </div>
                
                <div className="p-6 flex justify-center">
                  <img
                    src={produit.imagePrincipale}
                    alt={produit.nomProduit}
                    className="max-h-80 object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page - FIXE */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Ajouté le {formatDate(produit.created_at)}</span>
              </div>
              {produit.senteur && (
                <div className="flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Senteur: {produit.senteur}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                Imprimer
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2C] transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduitDetailsModal;