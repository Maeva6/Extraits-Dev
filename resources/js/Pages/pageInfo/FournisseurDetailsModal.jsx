import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Star, 
  Package,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  Truck,
  Award,
  FileText,
  ShoppingCart
} from 'lucide-react';

const FournisseurDetailsModal = ({ fournisseurId, onClose }) => {
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ingredients, setIngredients] = useState([]);
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
    const fetchFournisseurDetails = async () => {
      try {
        console.log('🔄 Chargement du fournisseur ID:', fournisseurId);
        const response = await axios.get(`/fournisseurs/${fournisseurId}`);
        console.log('✅ Données reçues:', response.data);
        
        // Vérifiez la structure des données
        if (response.data.success === false) {
          throw new Error(response.data.message || 'Fournisseur non trouvé');
        }
        
        // Si les données sont dans une clé 'data', utilisez-la, sinon utilisez directement
        const fournisseurData = response.data.data || response.data;
        console.log('📊 Données du fournisseur:', fournisseurData);
        
        setFournisseur(fournisseurData);
        
        // Charger les ingrédients fournis par ce fournisseur
        if (fournisseurData.nom_fournisseur) {
          console.log('🔄 Chargement des ingrédients pour:', fournisseurData.nom_fournisseur);
          try {
            const ingredientsResponse = await axios.get(`/ingredients`);
            const filteredIngredients = ingredientsResponse.data.filter(
              ingredient => ingredient.fournisseur === fournisseurData.nom_fournisseur
            );
            console.log('✅ Ingrédients trouvés:', filteredIngredients.length);
            setIngredients(filteredIngredients);
          } catch (ingredientError) {
            console.error('❌ Erreur chargement ingrédients:', ingredientError);
            setIngredients([]);
          }
        }
      } catch (err) {
        console.error('❌ Erreur détaillée:', err);
        setError(err.response?.data?.message || err.message || 'Erreur lors de la récupération des détails du fournisseur');
      } finally {
        setLoading(false);
      }
    };

    if (fournisseurId) {
      fetchFournisseurDetails();
    }
  }, [fournisseurId]);

  // Configuration du statut du fournisseur
  const getFournisseurConfig = () => {
    if (!fournisseur) {
      return {
        icon: AlertTriangle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Chargement...'
      };
    }
    
    const note = fournisseur.note || 0;
    
    if (note >= 4) {
      return {
        icon: Award,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Fournisseur premium'
      };
    } else if (note >= 3) {
      return {
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Fournisseur fiable'
      };
    } else if (note > 0) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Fournisseur standard'
      };
    } else {
      return {
        icon: Building,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Fournisseur'
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

  const renderStars = (note) => {
    const stars = [];
    const fullStars = Math.floor(note || 0);
    const hasHalfStar = (note || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={20} className="text-gray-300" />);
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
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
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

  if (!fournisseur) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-xl relative max-w-md">
          <p>Aucune donnée de fournisseur disponible</p>
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

  const fournisseurConfig = getFournisseurConfig();
  const FournisseurIcon = fournisseurConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* En-tête élégant - FIXE */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Détails du fournisseur</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="font-semibold">#{fournisseur.id?.toString().padStart(3, '0') || '000'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Enregistré le {formatDate(fournisseur.created_at)}</span>
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
        <div className={`${fournisseurConfig.bgColor} ${fournisseurConfig.borderColor} border-y p-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FournisseurIcon size={24} className={fournisseurConfig.color} />
              <div>
                <h3 className="font-semibold text-gray-900">Statut du fournisseur</h3>
                <p className={`text-sm ${fournisseurConfig.color}`}>{fournisseurConfig.label}</p>
              </div>
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
                    <Building size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Fournisseur</p>
                    <p className="font-semibold text-gray-900 text-lg">#{fournisseur.id?.toString().padStart(3, '0') || '000'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom du fournisseur</p>
                    <p className="font-semibold text-gray-900 text-lg">{fournisseur.nom_fournisseur || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Spécialité</p>
                    <p className="text-gray-900">{fournisseur.categorie_produit || 'Non spécifiée'}</p>
                  </div>
                </div>
              </div>

              {/* Carte Coordonnées */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Users size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Coordonnées</h3>
                </div>
                <div className="space-y-4">
                  {fournisseur.contact_tel ? (
                    <div className="flex items-center space-x-3">
                      <Phone size={18} className="text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900">{fournisseur.contact_tel}</p>
                        <p className="text-sm text-gray-600">Téléphone</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun téléphone spécifié</p>
                  )}
                  
                  {fournisseur.adresse_mail ? (
                    <div className="flex items-center space-x-3">
                      <Mail size={18} className="text-gray-500" />
                      <div>
                        <a 
                          href={`mailto:${fournisseur.adresse_mail}`}
                          className="font-semibold text-blue-600 hover:underline break-all"
                        >
                          {fournisseur.adresse_mail}
                        </a>
                        <p className="text-sm text-gray-600">Email</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun email spécifié</p>
                  )}
                  
                  {fournisseur.adresse_boutique ? (
                    <div className="flex items-start space-x-3">
                      <MapPin size={18} className="text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">{fournisseur.adresse_boutique}</p>
                        <p className="text-sm text-gray-600">Adresse</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune adresse spécifiée</p>
                  )}
                </div>
              </div>

              {/* Carte Évaluation */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Star size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Évaluation</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Note globale</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(fournisseur.note || 0)}
                      </div>
                      <span className="text-2xl font-bold text-[#D4AF37]">
                        {fournisseur.note || 0}/5
                      </span>
                    </div>
                  </div>
                  
                  {fournisseur.site_web ? (
                    <div className="flex items-center space-x-3 pt-2">
                      <Globe size={18} className="text-gray-500" />
                      <div>
                        <a 
                          href={fournisseur.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:underline break-all"
                        >
                          {fournisseur.site_web}
                        </a>
                        <p className="text-sm text-gray-600">Site web</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun site web spécifié</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Ingrédients fournis */}
            {ingredients.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <Package size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Ingrédients fournis</h3>
                    <span className="bg-[#D4AF37] text-white px-2 py-1 rounded-full text-sm font-medium">
                      {ingredients.length} ingrédient(s)
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{ingredient.nomIngredient}</p>
                            <p className="text-sm text-gray-600">{ingredient.categorie}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Stock:</span>
                            <span className={`font-semibold ${
                              ingredient.stockActuel === 0 
                                ? 'text-red-600' 
                                : ingredient.stockActuel < (ingredient.seuilAlerte || 10) 
                                  ? 'text-yellow-600' 
                                  : 'text-green-600'
                            }`}>
                              {ingredient.stockActuel || 0} unités
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Prix:</span>
                            <span className="font-semibold text-[#D4AF37]">
                              {ingredient.prix ? `${ingredient.prix} FCFA` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">État:</span>
                            <span className="font-semibold capitalize">{ingredient.etat_physique || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="">
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
                <span>Enregistré le {formatDate(fournisseur.created_at)}</span>
              </div>
              {fournisseur.categorie_produit && (
                <div className="flex items-center space-x-2">
                  <Truck size={16} />
                  <span>Spécialité: {fournisseur.categorie_produit}</span>
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

export default FournisseurDetailsModal;