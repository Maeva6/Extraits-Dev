import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  Package, 
  Tag, 
  Users, 
  Ruler, 
  DollarSign, 
  Calendar, 
  Archive, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  Truck,
  Award,
  FileText
} from 'lucide-react';

const IngredientDetailsModal = ({ ingredientId, onClose }) => {
  const [ingredient, setIngredient] = useState(null);
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
    const fetchIngredientDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/ingredients/${ingredientId}`);
        console.log('Ingredient data:', response.data);
        setIngredient(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des détails de l\'ingrédient');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (ingredientId) {
      fetchIngredientDetails();
    }
  }, [ingredientId]);

  // Configuration du statut de stock
  const getStockConfig = () => {
    const quantite = ingredient?.stockActuel || 0;
    const seuilAlerte = ingredient?.seuilAlerte || 10;
    
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

  const renderStars = (note) => {
    const stars = [];
    const fullStars = Math.floor(note || 0);
    const hasHalfStar = (note || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }
    return stars;
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

  if (!ingredient) {
    return null;
  }

  const stockConfig = getStockConfig();
  const StockIcon = stockConfig.icon;
  const estDisponible = ingredient.stockActuel > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* En-tête élégant - FIXE */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Détails de l'ingrédient</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="font-semibold">#{ingredient.id?.toString().padStart(3, '0') || '000'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Ajouté le {formatDate(ingredient.created_at)}</span>
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
                    <p className="text-sm text-gray-600 mb-1">Nom de l'ingrédient</p>
                    <p className="font-semibold text-gray-900 text-lg">{ingredient.nomIngredient || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                    <p className="text-gray-900">{ingredient.categorie || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">État physique</p>
                    <p className="text-gray-900 capitalize">{ingredient.etat_physique || 'Non spécifié'}</p>
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
                    <p className="text-sm text-gray-600 mb-1">Prix unitaire</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">
                      {ingredient.prix ? `${ingredient.prix} FCFA` : 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantité en stock</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{ingredient.stockActuel || 0} unités</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ingredient.stockActuel === 0
                          ? 'bg-red-100 text-red-800'
                          : ingredient.stockActuel < (ingredient.seuilAlerte || 10)
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {ingredient.stockActuel === 0 ? 'Rupture' : 
                         ingredient.stockActuel < (ingredient.seuilAlerte || 10) ? 'Faible' : 'Bon'}
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
                    <span className="text-gray-600">Seuil d'alerte</span>
                    <span className="font-semibold">{ingredient.seuilAlerte || '10'} unités</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">État</span>
                    <span className="font-semibold capitalize">{ingredient.etat_physique || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Statut</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      estDisponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {estDisponible ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Fournisseur */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Truck size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Fournisseur</h3>
                  {ingredient.fournisseur_info && (
                    <span className="bg-[#D4AF37] text-white px-2 py-1 rounded-full text-sm font-medium">
                      Partenaire
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {ingredient.fournisseur_info ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations de base du fournisseur */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Award size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{ingredient.fournisseur_info.nom_fournisseur}</h4>
                          <p className="text-gray-600">Fournisseur principal</p>
                        </div>
                      </div>
                      
                      {ingredient.fournisseur_info.categorie_produit && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Spécialité</p>
                          <p className="font-semibold text-gray-900">{ingredient.fournisseur_info.categorie_produit}</p>
                        </div>
                      )}
                      
                      {ingredient.fournisseur_info.note !== null && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Évaluation</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(ingredient.fournisseur_info.note)}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({ingredient.fournisseur_info.note}/5)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coordonnées du fournisseur */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Coordonnées</h4>
                      
                      {ingredient.fournisseur_info.contact_tel && (
                        <div className="flex items-center space-x-3">
                          <Phone size={18} className="text-gray-500" />
                          <span className="text-gray-900">{ingredient.fournisseur_info.contact_tel}</span>
                        </div>
                      )}
                      
                      {ingredient.fournisseur_info.adresse_mail && (
                        <div className="flex items-center space-x-3">
                          <Mail size={18} className="text-gray-500" />
                          <a 
                            href={`mailto:${ingredient.fournisseur_info.adresse_mail}`}
                            className="text-blue-600 hover:underline break-all"
                          >
                            {ingredient.fournisseur_info.adresse_mail}
                          </a>
                        </div>
                      )}
                      
                      {ingredient.fournisseur_info.adresse_boutique && (
                        <div className="flex items-start space-x-3">
                          <MapPin size={18} className="text-gray-500 mt-0.5" />
                          <span className="text-gray-900">{ingredient.fournisseur_info.adresse_boutique}</span>
                        </div>
                      )}
                      
                      {ingredient.fournisseur_info.site_web && (
                        <div className="flex items-center space-x-3">
                          <Globe size={18} className="text-gray-500" />
                          <a 
                            href={ingredient.fournisseur_info.site_web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {ingredient.fournisseur_info.site_web}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : ingredient.fournisseur ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-lg inline-block">
                      <Truck size={32} className="text-gray-400 mx-auto mb-2" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{ingredient.fournisseur}</h4>
                    <p className="text-gray-600">Informations détaillées non disponibles</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-lg inline-block">
                      <Truck size={32} className="text-gray-400 mx-auto mb-2" />
                    </div>
                    <p className="text-gray-600">Aucun fournisseur spécifié</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section Description */}
            {ingredient.description && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <FileText size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            )}

            {/* Section Image */}
            {ingredient.photo && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <Package size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Image de l'ingrédient</h3>
                  </div>
                </div>
                
                <div className="p-6 flex justify-center">
                  <img
                    src={ingredient.photo}
                    alt={ingredient.nomIngredient}
                    className="max-h-80 object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage non disponible%3C/text%3E%3C/svg%3E";
                    }}
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
                <span>Ajouté le {formatDate(ingredient.created_at)}</span>
              </div>
              {ingredient.categorie && (
                <div className="flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Catégorie: {ingredient.categorie}</span>
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

export default IngredientDetailsModal;