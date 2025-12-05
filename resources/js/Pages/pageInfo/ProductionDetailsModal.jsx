import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  Package, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Factory,
  FlaskConical,
  Scale,
  ClipboardList,
  Tag
} from 'lucide-react';

const ProductionDetailsModal = ({ productionId, onClose }) => {
  const [production, setProduction] = useState(null);
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
    const fetchProductionDetails = async () => {
      try {
        const response = await axios.get(`/productions/${productionId}`);
        setProduction(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des détails de la production');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productionId) {
      fetchProductionDetails();
    }
  }, [productionId]);

  // Configuration du statut de production
  const getProductionConfig = () => {
    const quantiteProduite = production?.quantite_produite || 0;
    
    if (quantiteProduite === 0) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Production échouée'
      };
    } else if (quantiteProduite < 10) {
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Petite production'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Production réussie'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction utilitaire pour trouver la catégorie
  const findCategorie = () => {
    if (!production?.produit) {
      return 'Non spécifiée';
    }

    const produit = production.produit;
    
    // Essayer tous les chemins possibles
    const possiblePaths = [
      produit.categorie?.name,
      produit.categorie,
      produit.categorie_id,
      produit.categorieName,
      produit.category,
      produit.category_id,
      produit.nomCategorie,
    ];

    for (const path of possiblePaths) {
      if (path && path !== 'null' && path !== 'undefined') {
        return path;
      }
    }

    return 'Non spécifiée';
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

  if (!production) {
    return null;
  }

  const productionConfig = getProductionConfig();
  const ProductionIcon = productionConfig.icon;
  const produitCategorie = findCategorie();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* En-tête élégant - FIXE */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Détails de la production</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="font-semibold">#{production.id?.toString().padStart(3, '0') || '000'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Produit le {formatDate(production.created_at)}</span>
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
        <div className={`${productionConfig.bgColor} ${productionConfig.borderColor} border-y p-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ProductionIcon size={24} className={productionConfig.color} />
              <div>
                <h3 className="font-semibold text-gray-900">Statut de production</h3>
                <p className={`text-sm ${productionConfig.color}`}>{productionConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Package size={20} className="text-gray-600" />
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                {production.quantite_produite || 0} unités produites
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
                    <Factory size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Production</p>
                    <p className="font-semibold text-gray-900 text-lg">#{production.id?.toString().padStart(3, '0') || '000'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date de production</p>
                    <p className="text-gray-900">{formatDate(production.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantité produite</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">{production.quantite_produite || 0} unités</p>
                  </div>
                </div>
              </div>

              {/* Carte Produit */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Package size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Produit fabriqué</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom du produit</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {production.produit?.nomProduit || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Produit</p>
                    <p className="text-gray-900">#{production.produit_id?.toString().padStart(3, '0') || '000'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                    <p className="text-gray-900 font-semibold">
                      {produitCategorie}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carte Formule */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <FlaskConical size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Formule utilisée</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom de la formule</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {production.formule?.nom_formule || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Formule</p>
                    <p className="text-gray-900">#{production.formule_id?.toString().padStart(3, '0') || '000'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Ingrédients utilisés */}
            {production.ingredients && production.ingredients.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <ClipboardList size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Ingrédients utilisés</h3>
                    <span className="bg-[#D4AF37] text-white px-2 py-1 rounded-full text-sm font-medium">
                      {production.ingredients.length} ingrédient(s)
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Ingrédient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Quantité utilisée
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Unité
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Catégorie
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {production.ingredients.map((ingredient, index) => (
                          <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {ingredient.nomIngredient || 'Non spécifié'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-lg font-bold text-[#D4AF37]">
                                {ingredient.pivot?.quantite_utilisee || '0'}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {ingredient.pivot?.unite || 'Non spécifié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {ingredient.categorie || 'Non spécifiée'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                <span>Produit le {formatDate(production.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag size={16} />
                <span>Catégorie: {produitCategorie}</span>
              </div>
            </div>
            <div className="flex space-x-3">
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
}

export default ProductionDetailsModal;