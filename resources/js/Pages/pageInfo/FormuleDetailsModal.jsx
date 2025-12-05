import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  FlaskConical, 
  Package, 
  Calendar, 
  User, 
  FileText,
  Scale,
  ClipboardList,
  Tag,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const FormuleDetailsModal = ({ formule: initialFormule, onClose }) => {
  const [formule, setFormule] = useState(initialFormule);
  const [loading, setLoading] = useState(!initialFormule);
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
    if (!initialFormule) {
      const fetchFormuleDetails = async () => {
        try {
          const response = await axios.get(`/formules/${initialFormule.id}`);
          if (response.data) {
            setFormule(response.data);
          } else {
            setError(response.data.message);
          }
        } catch (err) {
          setError('Erreur lors de la récupération des détails de la formule');
          console.error('Erreur:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchFormuleDetails();
    }
  }, [initialFormule]);

  // Configuration du statut de la formule
  const getFormuleConfig = () => {
    const ingredientsCount = formule?.ingredients?.length || 0;
    
    if (ingredientsCount === 0) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Formule incomplète'
      };
    } else if (ingredientsCount < 3) {
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Formule simple'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Formule complète'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
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

  if (!formule) {
    return null;
  }

  const formuleConfig = getFormuleConfig();
  const FormuleIcon = formuleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* En-tête élégant - FIXE */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Détails de la formule</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="font-semibold">#{formule.id?.toString().padStart(3, '0') || '000'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Créée le {formatDate(formule.dateCreation || formule.created_at)}</span>
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
        <div className={`${formuleConfig.bgColor} ${formuleConfig.borderColor} border-y p-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FormuleIcon size={24} className={formuleConfig.color} />
              <div>
                <h3 className="font-semibold text-gray-900">Statut de la formule</h3>
                <p className={`text-sm ${formuleConfig.color}`}>{formuleConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FlaskConical size={20} className="text-gray-600" />
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                {formule.ingredients?.length || 0} ingrédient(s)
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
                    <FlaskConical size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Formule</p>
                    <p className="font-semibold text-gray-900 text-lg">#{formule.id?.toString().padStart(3, '0') || '000'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom de la formule</p>
                    <p className="font-semibold text-gray-900 text-lg">{formule.nomFormule || formule.nom_formule || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Créateur</p>
                    <p className="text-gray-900">{formule.createur || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {/* Carte Produit final */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Package size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Produit final</h3>
                </div>
                <div className="space-y-3">
                  {formule.produit ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nom du produit</p>
                        <p className="font-semibold text-gray-900 text-lg">{formule.produit.nomProduit || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ID Produit</p>
                        <p className="text-gray-900">#{formule.produit.id || formule.produit_id || '000'}</p>
                      </div>
                      {formule.produit.prix && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Prix</p>
                          <p className="text-2xl font-bold text-[#D4AF37]">
                            {formule.produit.prix} FCFA
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Package size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun produit associé</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Carte Métadonnées */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Calendar size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Métadonnées</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date de création</span>
                    <span className="font-semibold">{formatDate(formule.dateCreation || formule.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold capitalize">{formule.type || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Statut</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formule.ingredients?.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {formule.ingredients?.length > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Description */}
            {formule.description && (
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
                    {formule.description}
                  </p>
                </div>
              </div>
            )}

            {/* Section Instructions */}
            {formule.instructions && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <ClipboardList size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                    {formule.instructions}
                  </p>
                </div>
              </div>
            )}

            {/* Section Ingrédients */}
            {formule.ingredients && formule.ingredients.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <Scale size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Ingrédients</h3>
                    <span className="bg-[#D4AF37] text-white px-2 py-1 rounded-full text-sm font-medium">
                      {formule.ingredients.length} ingrédient(s)
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Package size={16} />
                              <span>Ingrédient</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Scale size={16} />
                              <span>Quantité</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Tag size={16} />
                              <span>Unité</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <DollarSign size={16} />
                              <span>Prix unitaire</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formule.ingredients.map((ingredient, index) => (
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
                                  <p className="text-sm text-gray-500">
                                    {ingredient.categorie || 'Sans catégorie'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-lg font-bold text-[#D4AF37]">
                                {ingredient.pivot?.quantite || '0'}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {ingredient.pivot?.unite || 'Non spécifié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-gray-900">
                                {ingredient.prix ? `${ingredient.prix} FCFA` : 'N/A'}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Résumé des quantités */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Scale size={20} className="text-blue-600" />
                        <span className="font-semibold text-blue-900">Résumé de la formule</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-700">
                          Total des ingrédients: {formule.ingredients.length}
                        </p>
                        <p className="text-xs text-blue-600">
                          Formule créée le {formatDate(formule.dateCreation || formule.created_at)}
                        </p>
                      </div>
                    </div>
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
                <span>Créée le {formatDate(formule.dateCreation || formule.created_at)}</span>
              </div>
              {formule.createur && (
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Créateur: {formule.createur}</span>
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
}

export default FormuleDetailsModal;