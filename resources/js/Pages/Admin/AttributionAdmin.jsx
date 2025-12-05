import React, { useEffect, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from "../components/navBar";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash, Download, Search, User, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

// Composant de confirmation simple
const ConfirmDialog = ({ isOpen, onConfirm, onCancel, message, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
                    
                    {/* En-tête */}
                    <div className="bg-white px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>

                    {/* Contenu */}
                    <div className="px-6 py-4">
                        <p className="text-gray-700">{message}</p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
                        >
                            Annuler
                        </button>
                        
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AttributionAdmin() {
    const { props } = usePage();
    const user = props.user;
    const produits = props.produits || [];
    const zones = props.zones || [];

    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedProduit, setSelectedProduit] = useState('');
    const [selectedZone, setSelectedZone] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // États pour la modale de confirmation simplifiée
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmData, setConfirmData] = useState({
        type: '', // 'attribution' ou 'groupe'
        id: null,
        groupKey: null,
        groupData: null
    });

    // Charger les attributions
    useEffect(() => {
        const fetchAttributions = async () => {
            try {
                const response = await fetch('/attributions');
                if (!response.ok) {
                    throw new Error('Erreur de chargement des attributions');
                }
                const data = await response.json();
                setUpdates(data);
                
                const groups = groupAttributionsByReappro(data);
                const initialExpanded = {};
                Object.keys(groups).forEach(key => {
                    initialExpanded[key] = false;
                });
                setExpandedGroups(initialExpanded);
            } catch (error) {
                console.error("Erreur:", error);
                alert("Impossible de charger les attributions");
            } finally {
                setLoading(false);
            }
        };

        fetchAttributions();
    }, []);

    // Fonction pour grouper les attributions par réapprovisionnement
    const groupAttributionsByReappro = (attributions) => {
        const groups = {};
        
        attributions.forEach(attribution => {
            if (!attribution) return;
            
            const key = `${attribution.date_attribution}_${attribution.produit_id}`;
            
            if (!groups[key]) {
                groups[key] = {
                    id: attribution.id,
                    date: attribution.date_attribution,
                    produitId: attribution.produit_id,
                    produitNom: attribution.produit?.nomProduit || attribution.produit,
                    produit: attribution.produit,
                    totalQuantite: 0,
                    attributions: [],
                    zoneCount: 0
                };
            }
            
            groups[key].attributions.push(attribution);
            groups[key].totalQuantite += parseInt(attribution.quantite) || 0;
            groups[key].zoneCount += 1;
        });
        
        return Object.keys(groups)
            .sort((a, b) => {
                const dateA = groups[a].date;
                const dateB = groups[b].date;
                return new Date(dateB) - new Date(dateA);
            })
            .reduce((sorted, key) => {
                groups[key].attributions.sort((a, b) => {
                    const zoneA = a.zone?.nom || a.zone || '';
                    const zoneB = b.zone?.nom || b.zone || '';
                    return zoneA.localeCompare(zoneB);
                });
                sorted[key] = groups[key];
                return sorted;
            }, {});
    };

    // Fonction pour basculer l'expansion d'un groupe
    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey]
        }));
    };

    // Fonction pour ouvrir la confirmation pour une attribution
    const ouvrirConfirmationAttribution = (id) => {
        setConfirmData({
            type: 'attribution',
            id: id,
            groupKey: null,
            groupData: null
        });
        setShowConfirm(true);
    };

    // Fonction pour ouvrir la confirmation pour un groupe
    const ouvrirConfirmationGroupe = (groupKey, groupData) => {
        setConfirmData({
            type: 'groupe',
            id: null,
            groupKey: groupKey,
            groupData: groupData
        });
        setShowConfirm(true);
    };

    // Fonction pour supprimer une attribution
    const supprimerAttribution = async (id) => {
        try {
            setIsLoading(true);
            
            const response = await fetch(`/attributions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Erreur lors de la suppression');
            }
            
            // Mettre à jour la liste locale
            setUpdates(prev => prev.filter(item => item.id !== id));
            
            // Afficher un message de succès
            alert(result.message || 'Attribution supprimée avec succès');
            
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert(`Échec de la suppression : ${error.message || 'Erreur inconnue'}`);
        } finally {
            setIsLoading(false);
            setShowConfirm(false);
            setConfirmData({
                type: '',
                id: null,
                groupKey: null,
                groupData: null
            });
        }
    };

    // Fonction pour supprimer un groupe
    const supprimerGroupe = async (groupKey, groupData) => {
        try {
            setIsLoading(true);
            
            // Supprimer chaque attribution une par une
            for (const attribution of groupData.attributions) {
                await router.delete(`/attributions/${attribution.id}`, {
                    preserveScroll: true,
                    preserveState: true
                });
            }
            
            // Mettre à jour la liste locale
            setUpdates(prev => prev.filter(item => 
                !groupData.attributions.some(attr => attr.id === item.id)
            ));
            
            alert('attribution supprimé avec succès');
            
        } catch (error) {
            console.error('Erreur suppression groupe:', error);
            alert(`Impossible de supprimer : ${error.message || 'Erreur inconnue'}`);
        } finally {
            setIsLoading(false);
            setShowConfirm(false);
            setConfirmData({
                type: '',
                id: null,
                groupKey: null,
                groupData: null
            });
        }
    };

    // Fonction pour confirmer la suppression
    const handleConfirm = () => {
        if (confirmData.type === 'attribution') {
            supprimerAttribution(confirmData.id);
        } else if (confirmData.type === 'groupe') {
            supprimerGroupe(confirmData.groupKey, confirmData.groupData);
        }
    };

    // Fonction pour annuler la suppression
    const handleCancel = () => {
        setShowConfirm(false);
        setConfirmData({
            type: '',
            id: null,
            groupKey: null,
            groupData: null
        });
    };

    // Fonction pour déplier/replier TOUS les groupes
    const toggleAllGroups = () => {
        const groups = groupAttributionsByReappro(updates);
        const allGroupKeys = Object.keys(groups);
        
        const allExpanded = allGroupKeys.every(key => expandedGroups[key]);
        const newState = {};
        allGroupKeys.forEach(key => {
            newState[key] = !allExpanded;
        });
        setExpandedGroups(newState);
    };

    // Grouper et filtrer les attributions
    const groupedAttributions = groupAttributionsByReappro(updates);
    
    const filteredGroups = Object.keys(groupedAttributions)
        .filter(groupKey => {
            const group = groupedAttributions[groupKey];
            
            if (selectedProduit && group.produitId !== parseInt(selectedProduit)) return false;
            if (selectedZone) {
                const hasSelectedZone = group.attributions.some(attr => 
                    attr.zone_id === parseInt(selectedZone)
                );
                if (!hasSelectedZone) return false;
            }
            if (searchTerm && group.produitNom) {
                if (!group.produitNom.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            }
            if (startDate || endDate) {
                if (!group.date) return false;
                const dateAttrib = parseISO(group.date);
                if (startDate && dateAttrib < startDate) return false;
                if (endDate && dateAttrib > endDate) return false;
            }
            return true;
        })
        .reduce((filtered, groupKey) => {
            filtered[groupKey] = groupedAttributions[groupKey];
            return filtered;
        }, {});

    const exportToExcel = () => {
        if (Object.keys(filteredGroups).length === 0) {
            alert("Aucune attribution à exporter !");
            return;
        }

        try {
            const data = [];
            
            Object.keys(filteredGroups).forEach(groupKey => {
                const group = filteredGroups[groupKey];
                
                data.push({
                    'ID Groupe': group.id,
                    'Produit': group.produitNom,
                    'Zone': 'TOTAL GROUPÉ',
                    'Quantité': group.totalQuantite,
                    'Date': group.date 
                        ? format(parseISO(group.date), 'dd/MM/yyyy', { locale: fr }) 
                        : 'N/A',
                    'Nb Zones': group.zoneCount
                });
                
                group.attributions.forEach(attr => {
                    data.push({
                        'ID Groupe': `→ ${attr.id}`,
                        'Produit': '',
                        'Zone': attr.zone?.nom || attr.zone,
                        'Quantité': attr.quantite,
                        'Date': '',
                        'Nb Zones': ''
                    });
                });
            });

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(data);
            
            worksheet['!cols'] = [
                { width: 15 },  // ID Groupe
                { width: 30 },  // Produit
                { width: 25 },  // Zone
                { width: 12 },  // Quantité
                { width: 15 },  // Date
                { width: 10 }   // Nb Zones
            ];
            
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attributions");
            const fileName = `attributions_groupées_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
        } catch (error) {
            console.error("Erreur d'export Excel:", error);
            alert(`Échec de l'export : ${error.message}`);
        }
    };

    if (loading) return (
        <div className="p-6 bg-gray-100 min-h-screen w-full lg:ml-[225px] relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
        </div>
    );

    const allGroupKeys = Object.keys(groupedAttributions);
    const allExpanded = allGroupKeys.length > 0 && allGroupKeys.every(key => expandedGroups[key]);
    const someExpanded = allGroupKeys.some(key => expandedGroups[key]);

    // Messages pour la confirmation
    const getConfirmTitle = () => {
        return confirmData.type === 'attribution' 
            ? "Supprimer l'attribution" 
            : "Supprimer le réapprovisionnement";
    };

    const getConfirmMessage = () => {
        if (confirmData.type === 'attribution') {
            return "Êtes-vous sûr de vouloir supprimer cette attribution spécifique ?";
        } else if (confirmData.type === 'groupe' && confirmData.groupData) {
            const group = confirmData.groupData;
            return `Voulez-vous vraiment supprimer toute l'attribution du ${format(parseISO(group.date), 'dd/MM/yyyy', { locale: fr })} pour le produit "${group.produitNom}" ?`;
        }
        return "Êtes-vous sûr de vouloir effectuer cette suppression ?";
    };

    return (
        <div className="min-h-screen">
            <div className="flex">
                <Navbar/>
                <div className="w-0 lg:w-[225px] bg-red"></div>

                <div className="flex-1 bg-gray-100 w-full">
                    <div className="p-6 space-y-8 min-h-screen">
                        <div className="flex items-center justify-between border-b border-yellow-400 pb-2">
                            <h1 className="text-xl font-bold">HISTORIQUE DES ATTRIBUTIONS</h1>
                            <div className="flex items-center gap-4">
                                <Link href="#"><User size={24} color="#D4AF37" /></Link>
                                <span className="font-semibold">{user?.name || 'Admin'}</span>
                            </div>
                        </div>

                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 p-2 w-full pr-10 rounded focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white"
                            />
                            <Search
                                size={20}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                        </div>

                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <div className="sm:hidden w-full overflow-x-auto">
                                    <div className="flex items-center gap-2 w-full min-w-0">
                                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">De:</label>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Sélectionner"
                                            className="min-w-0 flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] h-[42px] bg-white"
                                            isClearable
                                            locale={fr}
                                        />
                                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">À:</label>
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Sélectionner"
                                            className="min-w-0 flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] h-[42px] bg-white"
                                            isClearable
                                            locale={fr}
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 w-full mt-2">
                                        <select
                                            value={selectedProduit}
                                            onChange={(e) => setSelectedProduit(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white h-[42px]"
                                        >
                                            <option value="">Tous les produits</option>
                                            {produits.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nomProduit} (Stock: {p.quantiteProduit || 0})
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedZone}
                                            onChange={(e) => setSelectedZone(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white h-[42px]"
                                        >
                                            <option value="">Toutes les zones</option>
                                            {zones.map(z => (
                                                <option key={z.id} value={z.id}>{z.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="hidden sm:flex items-center gap-4 w-full">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">De:</label>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Sélectionner"
                                            className="w-40 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] h-[42px] bg-white"
                                            isClearable
                                            locale={fr}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">À:</label>
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Sélectionner"
                                            className="w-40 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] h-[42px] bg-white"
                                            isClearable
                                            locale={fr}
                                        />
                                    </div>

                                    <select
                                        value={selectedProduit}
                                        onChange={(e) => setSelectedProduit(e.target.value)}
                                        className="block w-52 pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white h-[42px]"
                                    >
                                        <option value="">Tous les produits</option>
                                        {produits.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nomProduit} (Stock: {p.quantiteProduit || 0})
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedZone}
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                        className="block w-52 pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white h-[42px]"
                                    >
                                        <option value="">Toutes les zones</option>
                                        {zones.map(z => (
                                            <option key={z.id} value={z.id}>{z.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-end">
                                <button
                                    onClick={exportToExcel}
                                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
                                >
                                    <Download size={18} />
                                    <span>Exporter</span>
                                </button>
                                
                                <Link href="/formulaireattribution/admin" className="w-full sm:w-auto">
                                    <button className="bg-[#D4AF37] hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 w-full transition-colors">
                                        <Plus size={18} />
                                        <span>Nouvelle attribution</span>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {allGroupKeys.length > 0 && (
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={toggleAllGroups}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                                >
                                    {allExpanded ? (
                                        <>
                                            <ChevronRight size={16} />
                                            Replier tous
                                        </>
                                    ) : someExpanded ? (
                                        <>
                                            <ChevronDown size={16} />
                                            Déplier tous
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={16} />
                                            Déplier tous
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="bg-white shadow rounded overflow-hidden">
                            <div className="flex justify-between items-center bg-[#D4AF37] text-black font-semibold px-4 py-2">
                                <h2>Historique des attributions</h2>
                                <span className="text-sm bg-black text-white px-2 py-1 rounded-full">
                                    {Object.keys(filteredGroups).length} attribution(s)
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left w-8"></th>
                                            <th className="p-3 text-left">ID</th> 
                                            <th className="p-3 text-left">Produit</th>
                                            <th className="p-3 text-left">Quantité Totale</th>
                                            <th className="p-3 text-left">Nb Zones</th>
                                            <th className="p-3 text-left">Date</th>
                                            <th className="p-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(filteredGroups).length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-4 text-center text-gray-500">
                                                    Aucune attribution trouvée
                                                </td>
                                            </tr>
                                        ) : (
                                            Object.keys(filteredGroups).map((groupKey, groupIndex) => {
                                                const group = filteredGroups[groupKey];
                                                const isExpanded = expandedGroups[groupKey];
                                                
                                                return (
                                                    <React.Fragment key={groupKey}>
                                                        <tr 
                                                            className={`${groupIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 cursor-pointer`}
                                                            onClick={() => toggleGroup(groupKey)}
                                                        >
                                                            <td className="p-3">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleGroup(groupKey);
                                                                    }}
                                                                    className="text-gray-600 hover:text-gray-800"
                                                                >
                                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                                </button>
                                                            </td>
                                                            <td className="p-3 font text-md text-black">
                                                                #{group.id.toString().padStart(3, '0')}
                                                            </td>
                                                            <td className="p-3 font">
                                                                {group.produitNom}
                                                            </td>
                                                            <td className="p-3 font">
                                                                {group.totalQuantite}
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="inline-flex items-center justify-center bg-green-100 text-black-800 text-xs font-medium px-2 py-1 rounded-full">
                                                                    {group.zoneCount} zone(s)
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                {group.date 
                                                                    ? format(parseISO(group.date), 'dd/MM/yyyy', { locale: fr }) 
                                                                    : 'N/A'
                                                                }
                                                            </td>
                                                            <td className="p-3">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        ouvrirConfirmationGroupe(groupKey, group);
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 transition-colors bg-opacity-80 ml-2"
                                                                    title="Supprimer tout le réapprovisionnement"
                                                                >
                                                                    <Trash size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        
                                                        {isExpanded && group.attributions.map((attr, attrIndex) => (
                                                            <tr 
                                                                key={attr.id}
                                                                className={`${groupIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50`}
                                                                style={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                                                            >
                                                                <td className="p-3 pl-10 text-gray-400">
                                                                    ↳
                                                                </td>
                                                                <td className="p-3 pl-4 text-gray-600 font-mono text-sm">
                                                                    → #{attr.id.toString().padStart(3, '0')}
                                                                </td>
                                                                <td className="p-3 text-gray-600">
                                                                    {/* Vide pour l'alignement */}
                                                                </td>
                                                                <td className="p-3 text-gray-700">
                                                                    {attr.quantite}
                                                                </td>
                                                                <td className="p-3 text-gray-700">
                                                                    {attr.zone?.nom || attr.zone}
                                                                </td>
                                                                <td className="p-3 text-gray-700">
                                                                    {/* Vide pour l'alignement */}
                                                                </td>
                                                                <td className="p-3">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            ouvrirConfirmationAttribution(attr.id);
                                                                        }}
                                                                        className="text-red-400 hover:text-red-600 transition-colors bg-opacity-80"
                                                                        title="Supprimer cette attribution"
                                                                    >
                                                                        <Trash size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modale de confirmation simplifiée */}
                        <ConfirmDialog
                            isOpen={showConfirm}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                            title={getConfirmTitle()}
                            message={getConfirmMessage()}
                        />

                        {/* LOADER DE SUPPRESSION */}
                        {isLoading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-8 rounded-xl shadow-2xl">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
                                        <p className="text-gray-700 font-medium">Suppression en cours...</p>
                                        <p className="text-sm text-gray-500 mt-1">Veuillez patienter</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}