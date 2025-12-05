import React, { useEffect, useState, useMemo } from 'react';
import { Bell, Download, Search, Trash, Plus, User, Upload } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from "../components/navBar";
import FormuleDetailsModal from '../pageInfo/FormuleDetailsModal';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function Formules() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createurFilter, setCreateurFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormule, setSelectedFormule] = useState(null);
  const [showFormuleDetails, setShowFormuleDetails] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const { props } = usePage();
  const user = props.user;

  // UTIL: get CSRF token
  const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  // Fetch formules
  useEffect(() => {
    let mounted = true;
    const fetchFormules = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/formules');
        if (!mounted) return;
        const formules = response.data.map(formule => ({
          ...formule,
          Id: `#${formule.id.toString().padStart(3, '0')}`,
          dateCreation: formule.dateCreation ? new Date(formule.dateCreation) : null
        }));
        setUpdates(formules);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des formules');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFormules();
    return () => { mounted = false; };
  }, []);

  // Safe highlight function (avoid dangerouslySetInnerHTML)
  const highlightText = (text = '', term = '') => {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} className="font-bold text-[#D4AF37]">{part}</span> : <span key={i}>{part}</span>
    );
  };

  // Deletion flow
  const confirmDelete = (formuleId) => {
    setToDeleteId(formuleId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!toDeleteId) return;
    try {
      const csrfToken = getCsrfToken();
      // call delete endpoint (make sure route exists: DELETE /formules/{id})
      await axios.delete(`/formules/${toDeleteId}`, {
        headers: { 'X-CSRF-TOKEN': csrfToken }
      });

      // remove from UI (optimistic)
      setUpdates(prev => prev.filter(f => f.id !== toDeleteId));
      setShowConfirm(false);
      setToDeleteId(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Impossible de supprimer la formule. Vérifie la console pour plus de détails.');
      setShowConfirm(false);
      setToDeleteId(null);
    }
  };

  // Download template (unchanged)
  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const completeSheet = XLSX.utils.aoa_to_sheet([
      ['formule_nom', 'formule_description', 'produit_id', 'instructions', 'createur', 'ingredient_id', 'quantite', 'unite'],
      ['Exemple Formule', 'Description de la formule', '1', 'Instructions ici', 'Admin', '1', '100', 'g'],
      ['Exemple Formule', 'Description de la formule', '1', 'Instructions ici', 'Admin', '2', '200', 'mL'],
    ]);
    XLSX.utils.book_append_sheet(workbook, completeSheet, "Formules_Complet");
    XLSX.writeFile(workbook, "modele_formules_complet.xlsx");
  };

  // File import handler (kept, with logs)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const completeSheet = workbook.Sheets['Formules_Complet'];
        if (!completeSheet) {
          alert('Feuille "Formules_Complet" introuvable dans le fichier.');
          return;
        }
        const allData = XLSX.utils.sheet_to_json(completeSheet);
        // Grouper par formule comme avant
        const formulesMap = new Map();
        allData.forEach(row => {
          const formuleKey = `${row.formule_nom}-${row.produit_id}-${row.createur}`;
          if (!formulesMap.has(formuleKey)) {
            formulesMap.set(formuleKey, {
              nom_formule: row.formule_nom,
              description: row.formule_description,
              produit_id: row.produit_id,
              instructions: row.instructions,
              createur: row.createur,
              ingredients: []
            });
          }
          if (row.ingredient_id && row.quantite && row.unite) {
            formulesMap.get(formuleKey).ingredients.push({
              ingredient_id: row.ingredient_id,
              quantite: row.quantite,
              unite: row.unite
            });
          }
        });
        const dataToSend = Array.from(formulesMap.values());
        // POST to import
        const csrfToken = getCsrfToken();
        const response = await axios.post('/formules/import', { data: dataToSend }, {
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
          }
        });
        if (response.data.success) {
          alert(`${response.data.imported_count} formules importées avec succès !`);
          // refresh
          const fetchResponse = await axios.get('/formules');
          const updatedFormules = fetchResponse.data.map(formule => ({
            ...formule,
            Id: `#${formule.id.toString().padStart(3, '0')}`,
            dateCreation: formule.dateCreation ? new Date(formule.dateCreation) : null
          }));
          setUpdates(updatedFormules);
        } else {
          alert(response.data.message || 'Erreur à l\'importation');
        }
      } catch (error) {
        console.error("Erreur d'importation:", error);
        let errorMessage = "Erreur lors de l'importation";
        if (error.response?.data?.errors) {
          errorMessage += "\n\nErreurs de validation:\n";
          Object.entries(error.response.data.errors).forEach(([field, errors]) => {
            errorMessage += `- ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}\n`;
          });
        } else if (error.response?.data?.message) {
          errorMessage += `: ${error.response.data.message}`;
        }
        alert(errorMessage);
      }
    };
    reader.readAsArrayBuffer(file);
    // reset input value so same file can be re-uploaded later
    event.target.value = '';
  };

  // Export: include ingredients. Each ingredient becomes a line.
  const exportToXLSX = () => {
    try {
      if (updates.length === 0) {
        alert("Aucune donnée à exporter !");
        return;
      }

      const rows = [];
      const list = filteredUpdates; // uses memo below
      list.forEach(item => {
        // if ingredients exist in item, create multiple rows
        if (item.ingredients && item.ingredients.length > 0) {
          item.ingredients.forEach(ing => {
            rows.push({
              'ID': item.Id || '',
              'Nom de la formule': item.nomFormule || '',
              'Date de création': item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '',
              'Créateur': item.createur || '',
              'Description': item.description || '',
              'Instructions': item.instructions || '',
              'Produit ID': item.produit_id || '',
              'Ingredient ID': ing.id ?? ing.ingredient_id ?? '',
              'Quantité': ing.pivot?.quantite ?? ing.quantite ?? '',
              'Unité': ing.pivot?.unite ?? ing.unite ?? ''
            });
          });
        } else {
          rows.push({
            'ID': item.Id || '',
            'Nom de la formule': item.nomFormule || '',
            'Date de création': item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '',
            'Créateur': item.createur || '',
            'Description': item.description || '',
            'Instructions': item.instructions || '',
            'Produit ID': item.produit_id || '',
            'Ingredient ID': '',
            'Quantité': '',
            'Unité': ''
          });
        }
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Formules");
      const fileName = `formules_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'exportation des données.");
    }
  };

  // computed filtered updates (memoized)
  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      const matchesSearch = !searchTerm || (u.nomFormule && u.nomFormule.toLowerCase().includes(searchTerm.toLowerCase()));
      let matchesDates = true;
      if (startDate || endDate) {
        const creationDate = u.dateCreation ? new Date(u.dateCreation) : null;
        if (creationDate) {
          if (startDate && endDate) matchesDates = creationDate >= startDate && creationDate <= endDate;
          else if (startDate) matchesDates = creationDate >= startDate;
          else if (endDate) matchesDates = creationDate <= endDate;
        } else {
          matchesDates = false;
        }
      }
      const matchesCreateur = createurFilter ? u.createur === createurFilter : true;
      return matchesSearch && matchesDates && matchesCreateur;
    });
  }, [updates, searchTerm, startDate, endDate, createurFilter]);

  const createurs = useMemo(() => [...new Set(updates.map(update => update.createur).filter(Boolean))], [updates]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen w-full lg:ml-[225px] relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Navbar />
        <div className="w-0 lg:w-[225px] bg-red"></div>
        <div className="flex-1 bg-gray-100 w-full">
          <div className="p-6 space-y-8 min-h-screen">
            <div className="flex items-center justify-between border-b border-yellow-400 pb-2">
              <h1 className="text-xl font-bold">FORMULES</h1>
              <div className="flex items-center gap-4">
                <Link href="#"><User size={24} color="#D4AF37" /></Link>
                <span className="font-semibold">{user?.name || 'Admin'}</span>
              </div>
            </div>

            <div className="relative w-full mb-6">
              <input
                type="text"
                placeholder="Rechercher une formule..."
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
                <div className="relative w-full sm:w-52">
                  <select
                    value={createurFilter}
                    onChange={(e) => setCreateurFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent bg-white"
                  >
                    <option value="">Tous les créateurs</option>
                    {createurs.map((createur, index) => (
                      <option key={index} value={createur}>{createur}</option>
                    ))}
                  </select>
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
                      className="w-40 p-2 border border-gray-300 rounded-md h-[42px] bg-white"
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
                      className="w-40 p-2 border border-gray-300 rounded-md h-[42px] bg-white"
                      isClearable
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-end">
                <button onClick={downloadTemplate} className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 w-full sm:w-auto">
                  <Download size={18} />
                  <span>Télécharger le modèle</span>
                </button>

                <div className="w-full sm:w-auto">
                  <button
                    onClick={() => document.getElementById('file-upload').click()}
                    className="bg-[#09712B] hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2 w-full"
                  >
                    <Upload size={18} />
                    <span>Importer les données</span>
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept=".xlsx, .xls"
                  />
                </div>

                <Link href="/formulaireformule/admin" className="w-full sm:w-auto">
                  <button className="bg-[#D4AF37] hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2 w-full">
                    <Plus size={18} />
                    <span>Ajouter une formule</span>
                  </button>
                </Link>

                <button onClick={exportToXLSX} className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2 w-full sm:w-auto">
                  <Download size={18} />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
              <div className="flex justify-between items-center bg-[#D4AF37] text-black font-semibold px-4 py-2">
                <h2>Liste des Formules</h2>
                <span className="text-sm bg-black text-white px-2 py-1 rounded-full">{filteredUpdates.length} élément(s)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nom de la formule</th>
                      <th className="p-3 text-left">Date de création</th>
                      <th className="p-3 text-left">Créateur</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="p-3 text-center">Chargement en cours...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="6" className="p-3 text-center text-red-500">{error}</td></tr>
                    ) : filteredUpdates.length === 0 ? (
                      <tr><td colSpan="6" className="p-3 text-center">Aucune formule trouvée</td></tr>
                    ) : (
                      filteredUpdates.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{u.Id}</td>
                          <td className="p-3" onClick={() => { setSelectedFormule(u); setShowFormuleDetails(true); }}>
                            {highlightText(u.nomFormule || '', searchTerm)}
                          </td>
                          <td className="p-3">{u.dateCreation ? new Date(u.dateCreation).toLocaleDateString() : ''}</td>
                          <td className="p-3">{u.createur}</td>
                          <td className="p-3">{u.description}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); confirmDelete(u.id); }}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Supprimer"
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette formule ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => { setShowConfirm(false); setToDeleteId(null); }} className="px-4 py-2 border rounded">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {showFormuleDetails && (
        <FormuleDetailsModal formule={selectedFormule} onClose={() => setShowFormuleDetails(false)} />
      )}
    </div>
  );
}
