import React, { useRef } from 'react';
import { X, User, Package, CreditCard, MapPin, Calendar, MessageCircle, ShoppingCart, DollarSign, CheckCircle, Clock, Truck, Archive } from 'lucide-react';

const CommandeDetailsModal = ({ commande, onClose }) => {
    const modalRef = useRef();

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!commande) {
        return null;
    }

    // Configuration des statuts avec icônes et couleurs
    const statutConfig = {
        'en_attente': { 
            icon: Clock, 
            color: 'text-yellow-600', 
            bgColor: 'bg-yellow-50', 
            borderColor: 'border-yellow-200',
            label: 'En attente'
        },
        'payée': { 
            icon: CheckCircle, 
            color: 'text-green-600', 
            bgColor: 'bg-green-50', 
            borderColor: 'border-green-200',
            label: 'Payée'
        },
        'expédiée': { 
            icon: Truck, 
            color: 'text-blue-600', 
            bgColor: 'bg-blue-50', 
            borderColor: 'border-blue-200',
            label: 'Expédiée'
        },
        'livrée': { 
            icon: Package, 
            color: 'text-purple-600', 
            bgColor: 'bg-purple-50', 
            borderColor: 'border-purple-200',
            label: 'Livrée'
        },
        'annulée': { 
            icon: Archive, 
            color: 'text-red-600', 
            bgColor: 'bg-red-50', 
            borderColor: 'border-red-200',
            label: 'Annulée'
        }
    };

    const origineConfig = {
        'en_ligne': { 
            label: 'En ligne', 
            color: 'text-blue-600', 
            bgColor: 'bg-blue-50', 
            borderColor: 'border-blue-200'
        },
        'sur_place': { 
            label: 'Sur place', 
            color: 'text-green-600', 
            bgColor: 'bg-green-50', 
            borderColor: 'border-green-200'
        }
    };

    const currentStatut = statutConfig[commande.etat] || statutConfig['en_attente'];
    const currentOrigine = origineConfig[commande.origine] || { 
        label: commande.origine || 'Non spécifié', 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-50', 
        borderColor: 'border-gray-200'
    };

    const StatutIcon = currentStatut.icon;
    const OrigineIcon = commande.origine === 'en_ligne' ? ShoppingCart : MapPin;

    // Fonctions de calcul
    const calculateProductTotal = (produit) => {
        if (produit.total_produit) return produit.total_produit;
        const quantite = produit.quantite;
        const prixUnitaire = produit.prix_unitaire_numeric || parseFloat(produit.prix?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const total = quantite * prixUnitaire;
        return total.toLocaleString('fr-FR') + ' FCFA';
    };

    const calculateCommandeTotal = () => {
        return commande.montant || '0 FCFA';
    };

    const getTotalQuantite = () => {
        return commande.produits?.reduce((sum, produit) => sum + produit.quantite, 0) || 0;
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
                
                {/* En-tête élégant - FIXE */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="text-white">
                            <h1 className="text-3xl font-bold mb-2">Détails de la commande</h1>
                            <div className="flex items-center space-x-4 text-white/90">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                    <span className="font-semibold">{commande.display_id}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(commande.date_commande)}</span>
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
                <div className={`${currentStatut.bgColor} ${currentStatut.borderColor} border-y p-4 flex-shrink-0`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <StatutIcon size={24} className={currentStatut.color} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Statut de la commande</h3>
                                <p className={`text-sm ${currentStatut.color}`}>{currentStatut.label}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <OrigineIcon size={20} className="text-gray-600" />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentOrigine.bgColor} ${currentOrigine.borderColor} ${currentOrigine.color} border`}>
                                {currentOrigine.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contenu principal - SCROLLABLE SANS BARRE VISIBLE */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                    <div className="space-y-6">
                        
                        {/* Cartes d'informations */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Carte Client */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <User size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Client</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                                        <p className="font-semibold text-gray-900 text-lg">{commande.nom_client}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Email</p>
                                        <p className="text-gray-900">{commande.email_client || 'Non spécifié'}</p>
                                    </div>
                                    {commande.telephone_client && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                                            <p className="text-gray-900">{commande.telephone_client}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Carte Paiement */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <CreditCard size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Paiement</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Mode de paiement</p>
                                        <p className="font-semibold text-gray-900">{commande.paiement}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Montant total</p>
                                        <p className="text-2xl font-bold text-[#D4AF37]">{calculateCommandeTotal()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Carte Résumé */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <DollarSign size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Résumé</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Produits différents</span>
                                        <span className="font-semibold">{commande.produits?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Quantité totale</span>
                                        <span className="font-semibold">{getTotalQuantite()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Valeur totale</span>
                                        <span className="font-bold text-[#D4AF37] text-lg">{calculateCommandeTotal()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Produits */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <Package size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Produits commandés</h3>
                                    <span className="bg-[#D4AF37] text-white px-2 py-1 rounded-full text-sm font-medium">
                                        {commande.produits?.length || 0} article(s)
                                    </span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Produit</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-700">Quantité</th>
                                            <th className="px-6 py-4 text-right font-semibold text-gray-700">Prix unitaire</th>
                                            <th className="px-6 py-4 text-right font-semibold text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {commande.produits && commande.produits.length > 0 ? (
                                            commande.produits.map((produit, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-lg flex items-center justify-center">
                                                                <Package size={16} className="text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{produit.nom}</p>
                                                                {produit.categorie && (
                                                                    <p className="text-sm text-gray-500">{produit.categorie}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                                                            {produit.quantite}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-700">
                                                        {produit.prix_unitaire || produit.prix || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-[#D4AF37] text-lg">
                                                            {calculateProductTotal(produit)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center space-y-3 text-gray-400">
                                                        <Package size={48} />
                                                        <p className="text-lg">Aucun produit dans cette commande</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {commande.produits && commande.produits.length > 0 && (
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-right font-semibold text-gray-700 text-lg">
                                                    Total général
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-gray-900 text-xl">
                                                        {calculateCommandeTotal()}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Section Informations supplémentaires */}
                        {(commande.commentaire || commande.adresse_livraison) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {commande.commentaire && (
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="p-2 bg-amber-500 bg-opacity-10 rounded-lg">
                                                <MessageCircle size={20} className="text-amber-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-amber-900">Commentaire</h3>
                                        </div>
                                        <p className="text-amber-800 leading-relaxed">{commande.commentaire}</p>
                                    </div>
                                )}
                                {commande.adresse_livraison && (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
                                                <MapPin size={20} className="text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-blue-900">Livraison</h3>
                                        </div>
                                        <p className="text-blue-800 leading-relaxed">{commande.adresse_livraison}</p>
                                    </div>
                                )}
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
                                <span>Créée le {formatDate(commande.date_commande)}</span>
                            </div>
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

export default CommandeDetailsModal;