import { Link, usePage, router } from '@inertiajs/react';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmDialog from '../reutilisable/popUpSuppressionProduit';
import { useState } from 'react';
import { Download, User, Search, Trash, Plus, Edit, ChevronDown } from 'lucide-react';
import Navbar from '../components/navBar';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import CommandeDetailsModal from '../pageInfo/CommandeDetailsModal'; 

export default function commandeAdmin({ user, commandes = [] }) {
  console.log('Commandes reçues :', commandes);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [produitASupprimer, setProduitASupprimer] = useState(null);
  const [valeur, setValeur] = useState('');
  const [editingStatut, setEditingStatut] = useState(null);
  const [newStatut, setNewStatut] = useState('');
  const [etatFilter, setEtatFilter] = useState('');
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleRowClick = (commande, event) => {
    // Vérifier si le clic vient d'un bouton ou d'un élément interactif
    if (event.target.closest('button') || event.target.closest('select') || event.target.closest('a')) {
      return; // Ignorer le clic si c'est un bouton, select ou lien
    }
    
    console.log('Commande cliquée:', commande);
    setSelectedCommande(commande);
    setShowDetailsModal(true);
  };

 const supprimerProduit = (id) => {
  console.log('Suppression de la commande:', id);
  
  router.delete(`/ordersCommande/${id}`, {
    onSuccess: () => {
      console.log('Commande supprimée avec succès');
      
      // Recharger la page pour actualiser la liste des commandes
      router.reload();
      
      // Optionnel : Afficher un message de confirmation
      alert('Commande supprimée avec succès');
    },
    onError: (errors) => {
      console.error('Erreur lors de la suppression:', errors);
      alert('Erreur lors de la suppression de la commande');
    }
  });
  
  setShowConfirm(false);
  setProduitASupprimer(null);
};

  const updateStatut = (commandeId, nouveauStatut) => {
    router.put(`/commandes/${commandeId}/statut`, {
      statutCommande: nouveauStatut
    }, {
      onSuccess: () => {
        alert('Statut mise à jour avec succès');
        router.reload();
      },
      onError: (errors) => {
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  };

  const startEdit = (commandeId, currentStatut) => {
    setEditingStatut(commandeId);
    setNewStatut(currentStatut);
  };

  const cancelEdit = () => {
    setEditingStatut(null);
    setNewStatut('');
  };

  const saveEdit = (commandeId) => {
    if (newStatut) {
      updateStatut(commandeId, newStatut);
    }
    setEditingStatut(null);
  };

  // Fonction pour formater la date exactement comme dans la page de production
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  // Fonction pour formater avec l'heure (si nécessaire)
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const exportToXLSX = () => {
    if (filteredUpdates.length === 0) {
      alert("Aucune donnée à exporter !");
      return;
    }
  
    // Prépare les données pour l'export
    const headers = ['ID', 'Date commande','Nom du client', 'Paiement', 'Montant', 'Etat'];
    const data = filteredUpdates.map((item) => [
      item.display_id,
      formatDate(item.date_commande),
      item.nom_client,
      item.paiement,
      item.montant,
      item.etat,
    ]);
  
    // Crée un nouveau classeur Excel
    const workbook = XLSX.utils.book_new();
  
    // Crée une feuille de calcul
    const worksheet = XLSX.utils.aoa_to_sheet([
      headers, // Ajoute les en-têtes
      ...data,  // Ajoute les données
    ]);
  
    // Ajoute la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes");
  
    // Génère le fichier XLSX
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `commandes_export_${date}.xlsx`);
  };

  // Filtrage combiné par recherche et par état
  const filteredUpdates = commandes.filter((u) => {
    const matchesSearch = u.nom_client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEtat = etatFilter === '' || u.etat === etatFilter;

    // Filtrage par date
    let matchesDate = true;
    if (startDate || endDate) {
      const commandeDate = new Date(u.date_commande);
      
      if (startDate && endDate) {
        matchesDate = commandeDate >= startDate && commandeDate <= endDate;
      } else if (startDate) {
        matchesDate = commandeDate >= startDate;
      } else if (endDate) {
        matchesDate = commandeDate <= endDate;
      }
    }
  
    return matchesSearch && matchesEtat && matchesDate;
  });

  // Options pour le filtre d'état
  const etatOptions = [
    { value: '', label: 'Tous les états' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'payée', label: 'Payée' },
    { value: 'expédiée', label: 'Expédiée' },
    { value: 'livrée', label: 'Livrée' },
    { value: 'annulée', label: 'Annulée' }
  ];

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Navbar/>
        <div className="w-0 lg:w-[225px] bg-red"></div>

        <div className="flex-1 bg-gray-100 w-full">
          <div className="p-6 space-y-8 min-h-screen">
            
            <div className="flex items-center justify-between border-b border-yellow-400 pb-2">
              <h1 className="text-xl font-bold">COMMANDES</h1>
              <div className="flex items-center gap-4">
                <Link href="#"><User size={24} color="#D4AF37" /></Link>
                <span className="font-semibold">{user?.name || 'Admin'}</span>
              </div>
            </div>

            <div className="relative w-full mb-6">
              <input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 p-2 w-full pr-10 rounded focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white"
              />
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Layout principal */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Filtre par état */}
                <div className="relative w-full sm:w-52">
                  <select
                    value={etatFilter}
                    onChange={(e) => setEtatFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    {etatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Filtres par date */}
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
                    className="min-w-0 flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-blue-500 h-[42px] bg-white"
                    isClearable
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
                    className="min-w-0 flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-[#D4AF37]-500 h-[42px] bg-white"
                    isClearable
                  />
                </div>
              </div>
              <div className="hidden sm:flex items-end gap-4">
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
                    className="w-40 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37]-500 focus:border-[#D4AF37]-500 h-[42px] bg-white"
                    isClearable
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
                    className="w-40 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37]-500 focus:border-[#D4AF37]-500 h-[42px] bg-white"
                    isClearable
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6 mt-10">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-end">
                <Link href="/formulairecommande/admin" className="w-full sm:w-auto">
                  <button className="bg-[#D4AF37] hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 w-full transition-colors">
                    <Plus size={18} />
                    <span>Ajouter une commande</span>
                  </button>
                </Link>
                <button
                  onClick={exportToXLSX}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
                >
                  <Download size={18} />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
              <div className="flex justify-between items-center bg-[#D4AF37] text-black font-semibold px-4 py-2">
                <h2>Liste des commandes</h2>
                <span className="text-sm bg-black text-white px-2 py-1 rounded-full">
                  {filteredUpdates.length} élément(s)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Date de commande</th>
                      <th className="p-3 text-left">Nom du client</th>
                      <th className="p-3 text-left">Paiement</th>
                      <th className="p-3 text-left">Montant</th>
                      <th className="p-3 text-left">Etat</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUpdates.map((u) => (
                      <tr 
                        key={u.id} 
                        className="border-b hover:bg-gray-50 cursor-pointer" 
                        onClick={(e) => handleRowClick(u, e)}
                      >
                        <td className="p-3">{u.display_id}</td>
                        <td className="p-3">{formatDate(u.date_commande)}</td>
                        <td className="p-3" dangerouslySetInnerHTML={{
                          __html: u.nom_client.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<span class="font-bold text-[#D4AF37]">$1</span>'
                          )
                        }} />
                        <td className="p-3">{u.paiement}</td>
                        <td className="p-3">{u.montant}</td>
                        
                        {/* Colonne État */}
                        <td className="p-3">
                          {editingStatut === u.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={newStatut}
                                onChange={(e) => setNewStatut(e.target.value)}
                                className="border border-gray-300 p-1 rounded text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="en_attente">En attente</option>
                                <option value="payée">Payée</option>
                                <option value="expédiée">Expédiée</option>
                                <option value="livrée">Livrée</option>
                                <option value="annulée">Annulée</option>
                              </select>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEdit(u.id);
                                }}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                              >
                                ✓
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEdit();
                                }}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                u.etat === 'payée' ? 'bg-green-100 text-green-800' :
                                u.etat === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                u.etat === 'expédiée' ? 'bg-blue-100 text-blue-800' :
                                u.etat === 'livrée' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {u.etat}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(u.id, u.etat);
                                }}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                title="Modifier le statut"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        
                        {/* Colonne Actions */}
                        <td className="p-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProduitASupprimer(u.id);
                              setShowConfirm(true);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Supprimer la commande"
                          >
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={() => supprimerProduit(produitASupprimer)}
        onCancel={() => setShowConfirm(false)}
        message="Êtes-vous sûr de vouloir supprimer cette commande ?"
      />
      {showDetailsModal && selectedCommande && (
        <CommandeDetailsModal
          commande={selectedCommande}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCommande(null);
          }}
        />
      )}
    </div>
  );
}