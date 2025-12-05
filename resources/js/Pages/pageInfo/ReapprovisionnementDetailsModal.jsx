import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  Truck, 
  Package, 
  Calendar, 
  Scale,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText
} from 'lucide-react';

const ReapprovisionnementDetailsModal = ({ reapproId, onClose }) => {
  const [reappro, setReappro] = useState(null);
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
    const fetchReapproDetails = async () => {
      try {
        const response = await axios.get(`/reapprovisionnements/${reapproId}`);
        if (response.data) {
          setReappro(response.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Erreur lors de la récupération des détails du réapprovisionnement');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reapproId) {
      fetchReapproDetails();
    }
  }, [reapproId]);

  // Configuration du statut du réapprovisionnement
  const getReapproConfig = () => {
    const quantite = reappro?.quantite || 0;
    
    if (quantite === 0) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Réapprovisionnement vide'
      };
    } else if (quantite < 10) {
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Petit réapprovisionnement'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Réapprovisionnement complet'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
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

  if (!reappro) {
    return null;
  }

  const reapproConfig = getReapproConfig();
  const ReapproIcon = reapproConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* En-tête élégant - FIXE */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Détails du réapprovisionnement</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="font-semibold">#{reappro.Id || reappro.id?.toString().padStart(3, '0') || '000'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Effectué le {formatDate(reappro.dateReapprovisionnement || reappro.created_at)}</span>
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
        <div className={`${reapproConfig.bgColor} ${reapproConfig.borderColor} border-y p-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ReapproIcon size={24} className={reapproConfig.color} />
              <div>
                <h3 className="font-semibold text-gray-900">Statut du réapprovisionnement</h3>
                <p className={`text-sm ${reapproConfig.color}`}>{reapproConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Truck size={20} className="text-gray-600" />
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                {reappro.quantite || 0} unité(s) ajoutée(s)
              </span>
            </div>
          </div>
        </div>

        {/* Contenu principal - SCROLLABLE SANS BARRE VISIBLE */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          <div className="space-y-6">
            
            {/* Cartes d'informations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Carte Informations générales */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Truck size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Réapprovisionnement</p>
                    <p className="font-semibold text-gray-900 text-lg">#{reappro.Id || reappro.id?.toString().padStart(3, '0') || '000'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-gray-900">{formatDate(reappro.dateReapprovisionnement || reappro.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantité ajoutée</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">{reappro.quantite || 0} unités</p>
                  </div>
                </div>
              </div>

              {/* Carte Ingrédient */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Package size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Ingrédient</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom de l'ingrédient</p>
                    <p className="font-semibold text-gray-900 text-lg">{reappro.nomIngredient || 'Non spécifié'}</p>
                  </div>
                  {reappro.categorie && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                      <p className="text-gray-900">{reappro.categorie}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Carte Fournisseur */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <Building size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Fournisseur</h3>
                </div>
                <div className="space-y-4">
                  {reappro.fournisseur ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nom du fournisseur</p>
                        <p className="font-semibold text-gray-900 text-lg">{reappro.fournisseur}</p>
                      </div>
                      {reappro.contact_fournisseur && (
                        <div className="flex items-center space-x-3">
                          <User size={18} className="text-gray-500" />
                          <div>
                            <p className="font-semibold text-gray-900">{reappro.contact_fournisseur}</p>
                            <p className="text-sm text-gray-600">Contact</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Building size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun fournisseur spécifié</p>
                    </div>
                  )}
                </div>
              </div>

               {/* Carte Impact */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                    <FileText size={20} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Impact sur le stock</h3>
                </div>
                <div className="space-y-4">
                  {reappro.fournisseur ? (
                    <>
                      <div>
                        <p className="text-sm text-green-600 mb-1">Quantité ajoutée</p>
                        <p className="text-2xl font-bold text-green-700">+{reappro.quantite || 0}</p>
                        <p className="text-xs text-green-500">unités</p>
                      </div>
                      {reappro.contact_fournisseur && (
                        <div className="flex items-center space-x-3">
                          <User size={18} className="text-gray-500" />
                          <div>
                            <p className="font-semibold text-gray-900">{reappro.contact_fournisseur}</p>
                            <p className="text-sm text-gray-600">Contact</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Building size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun fournisseur spécifié</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Notes */}
            {reappro.notes && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                      <FileText size={20} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                    {reappro.notes}
                  </p>
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
                <span>Effectué le {formatDate(reappro.dateReapprovisionnement || reappro.created_at)}</span>
              </div>
              {reappro.fournisseur && (
                <div className="flex items-center space-x-2">
                  <Building size={16} />
                  <span>Fournisseur: {reappro.fournisseur}</span>
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

export default ReapprovisionnementDetailsModal;