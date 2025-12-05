import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Award
} from 'lucide-react';

const ClientDetailsModal = ({ clientId, onClose }) => {
    const [client, setClient] = useState(null);
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
        const fetchClientDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/clients/${clientId}`);
                
                console.log("Réponse API Client:", response.data);
                
                if (response.data) {
                    setClient(response.data);
                } else {
                    setError("Aucune donnée valide reçue");
                }
            } catch (err) {
                console.error("Erreur détaillée:", err);
                setError(err.response?.data?.message || 'Erreur de chargement des données');
            } finally {
                setLoading(false);
            }
        };
  
        if (clientId) {
            fetchClientDetails();
        }
    }, [clientId]);

    // Configuration du statut du client
    const getClientConfig = () => {
        if (!client) {
            return {
                icon: AlertTriangle,
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                label: 'Chargement...'
            };
        }
        
        const status = client.status?.toLowerCase();
        
        if (status === 'actif' || !status) {
            return {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                label: 'Actif'
            };
        } else if (status === 'inactif') {
            return {
                icon: Clock,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                label: 'Inactif'
            };
        } else {
            return {
                icon: User,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                label: client.status || 'Client'
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
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        const colors = {
            'actif': 'bg-green-100 text-green-800',
            'inactif': 'bg-red-100 text-red-800',
            'en attente': 'bg-yellow-100 text-yellow-800'
        };
        return colors[statusLower] || 'bg-gray-100 text-gray-800';
    };

    const getStatusDisplay = (status) => {
        const statusLower = status?.toLowerCase();
        const displays = {
            'actif': 'Actif',
            'inactif': 'Inactif',
            'en attente': 'En attente'
        };
        return displays[statusLower] || status || 'Actif';
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
  
    if (!client) {
        return null;
    }

    const clientConfig = getClientConfig();
    const ClientIcon = clientConfig.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col overflow-hidden">
                
                {/* En-tête élégant - FIXE */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] p-6 rounded-t-2xl flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="text-white">
                            <h1 className="text-3xl font-bold mb-2">Détails du client</h1>
                            <div className="flex items-center space-x-4 text-white/90">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                    <span className="font-semibold">#{client.id.toString().padStart(3, '0')}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} />
                                    <span>Membre depuis {formatDate(client.created_at)}</span>
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
                <div className={`${clientConfig.bgColor} ${clientConfig.borderColor} border-y p-4 flex-shrink-0`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <ClientIcon size={24} className={clientConfig.color} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Statut du client</h3>
                                <p className={`text-sm ${clientConfig.color}`}>{clientConfig.label}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <User size={20} className="text-gray-600" />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                                {getStatusDisplay(client.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contenu principal - SCROLLABLE */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                    <div className="space-y-6">
                        
                        {/* Cartes d'informations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Carte Informations personnelles */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <User size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">ID Client</p>
                                        <p className="font-semibold text-gray-900 text-lg">#{client.id.toString().padStart(3, '0')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                                        <p className="font-semibold text-gray-900 text-lg">{client.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail size={18} className="text-gray-500" />
                                        <div>
                                            <a 
                                                href={`mailto:${client.email}`}
                                                className="font-semibold text-blue-600 hover:underline break-all"
                                            >
                                                {client.email}
                                            </a>
                                            <p className="text-sm text-gray-600">Email</p>
                                        </div>
                                    </div>
                                    {client.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone size={18} className="text-gray-500" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{client.phone}</p>
                                                <p className="text-sm text-gray-600">Téléphone</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Carte Détails complémentaires */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <Briefcase size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Détails complémentaires</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Statut</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                                            {getStatusDisplay(client.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar size={18} className="text-gray-500" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{formatDate(client.created_at)}</p>
                                            <p className="text-sm text-gray-600">Date d'inscription</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar size={18} className="text-gray-500" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{formatDate(client.updated_at)}</p>
                                            <p className="text-sm text-gray-600">Dernière mise à jour</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Carte Adresse */}
                            {client.address && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                            <MapPin size={20} className="text-[#D4AF37]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <MapPin size={18} className="text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{client.address}</p>
                                                <p className="text-sm text-gray-600">Adresse postale</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Carte Informations de contact */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-[#D4AF37] bg-opacity-10 rounded-lg">
                                        <Shield size={20} className="text-[#D4AF37]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Informations de contact</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Email vérifié</span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Oui
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Contact préféré</span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Email
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pied de page - FIXE */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex-shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar size={16} />
                                <span>Membre depuis {formatDate(client.created_at)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <User size={16} />
                                <span>Statut: {getStatusDisplay(client.status)}</span>
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

export default ClientDetailsModal;