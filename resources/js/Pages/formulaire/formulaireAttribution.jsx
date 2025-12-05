import React, { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, CheckCircle, Package, MapPin, Calendar, ChevronRight } from 'lucide-react';
import Navbar from "../components/navBar";

export default function FormulaireAttribution() { // Nom avec F majuscule
  const { props } = usePage();
  const user = props.auth?.user || props.user;
  const produits = props.produits || [];
  const zonesServer = props.zones || [];

  const [produitId, setProduitId] = useState('');
  const [produitStock, setProduitStock] = useState(0);
  const [produitSelectionne, setProduitSelectionne] = useState(null);
  const [dateAttrib, setDateAttrib] = useState(new Date().toISOString().slice(0,10));
  const [lines, setLines] = useState([{zone_id:'',nouvelle_zone:'',quantite:0}]);
  const [zones, setZones] = useState(zonesServer);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [nouvelleZoneNom, setNouvelleZoneNom] = useState('');

  const onProduitChange = (id) => {
    setProduitId(id);
    setError('');
    const p = produits.find(pr => String(pr.id) === String(id));
    setProduitStock(p ? Number(p.quantiteProduit) : 0);
    setProduitSelectionne(p);
  };

  const totalAssigned = useMemo(() => 
    lines.reduce((s, l) => s + Number(l.quantite || 0), 0), 
    [lines]
  );
  
  const remainingStock = produitStock - totalAssigned;

  const availableZonesForRow = (rowIndex) => {
    const chosen = lines
      .map((r, idx) => idx === rowIndex ? null : r.zone_id ? Number(r.zone_id) : null)
      .filter(Boolean);
    return zones.filter(z => !chosen.includes(Number(z.id)));
  };

  const addLine = () => { 
    setLines(prev => [...prev, {zone_id:'', nouvelle_zone:'', quantite:0}]);
    setError('');
  };

  const removeLine = (idx) => { 
    if (lines.length > 1) {
      setLines(prev => prev.filter((_, i) => i !== idx));
      setError('');
    }
  };

  const updateLine = (idx, key, value) => { 
    setLines(prev => { 
      const copy = [...prev]; 
      copy[idx] = {...copy[idx], [key]: value}; 
      return copy; 
    }); 
    setError('');
  };

  const createZone = (name) => {
    if (!name.trim()) {
      setError('Le nom de la zone ne peut pas être vide');
      return;
    }

    router.post('/attributions/zone', { nom: name }, {
      onSuccess: (page) => {
        const newZone = page.props.zone;
        setZones(prev => [...prev, newZone]);
        setShowZoneModal(false);
        setNouvelleZoneNom('');
        // Sélectionner automatiquement la nouvelle zone
        const lastLineIndex = lines.length - 1;
        updateLine(lastLineIndex, 'zone_id', newZone.id);
      },
      onError: (errors) => {
        setError(errors?.nom?.[0] || 'Erreur lors de la création de la zone');
      }
    });
  };

  const validateBeforeSubmit = () => {
    if (!produitId) { 
      setError('Veuillez sélectionner un produit.'); 
      return false; 
    }
    
    if (lines.length === 0) { 
      setError('Ajoutez au moins une attribution.'); 
      return false; 
    }

    // Vérifier que toutes les lignes ont une zone ou nouvelle zone
    for(let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if(!l.zone_id && !l.nouvelle_zone) { 
        setError(`La ligne ${i+1} doit avoir une zone existante ou un nom de nouvelle zone.`); 
        return false; 
      }
      
      const q = Number(l.quantite);
      if(!Number.isInteger(q) || q <= 0) { 
        setError(`La quantité de la ligne ${i+1} doit être un nombre entier positif.`); 
        return false; 
      }
    }

    const zoneIds = lines.map(l => l.zone_id ? String(l.zone_id) : null).filter(Boolean);
    if(new Set(zoneIds).size !== zoneIds.length) { 
      setError('Une même zone ne peut pas être sélectionnée deux fois.'); 
      return false; 
    }

    if(totalAssigned > produitStock) { 
      setError(`La somme des quantités (${totalAssigned}) dépasse le stock disponible (${produitStock}).`); 
      return false; 
    }

    if(totalAssigned <= 0) { 
      setError('La quantité totale attribuée doit être supérieure à 0.'); 
      return false; 
    }

    setError('');
    return true;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    setIsSubmitting(true);
    setError('');

    const payload = {
      produit_id: produitId,
      date_attribution: dateAttrib,
      lines: lines.map(l => ({ 
        zone_id: l.zone_id || null, 
        nouvelle_zone: l.nouvelle_zone || null, 
        quantite: Number(l.quantite || 0) 
      }))
    };

    router.post('/attributions', payload, {
      onSuccess: () => {
        setSuccessMsg('Réapprovisionnement effectué avec succès !');
        setIsSubmitting(false);
        
        // Redirection après 2 secondes
        setTimeout(() => {
          router.visit('/attribution/admin');
        }, 2000);
      },
      onError: (errors) => {
        setIsSubmitting(false);
        if (errors) {
          const firstError = Object.values(errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setError('Une erreur est survenue lors de l\'enregistrement');
        }
      }
    });
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Navbar/>
        <div className="w-0 lg:w-[225px] bg-red"></div>

        <div className="flex-1 bg-gray-100 w-full">
          <div className="p-6 space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-yellow-400 pb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.visit('/attribution/admin')}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37] transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Retour</span>
                </button>
                <ChevronRight size={16} className="text-gray-400" />
                <h1 className="text-xl font-bold text-gray-800">NOUVEAU RÉAPPROVISIONNEMENT</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">{user?.name || 'Admin'}</span>
              </div>
            </div>

            {/* Messages */}
            {successMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={20} />
                  <div>
                    <p className="text-green-800 font-medium">{successMsg}</p>
                    <p className="text-green-600 text-sm mt-1">Redirection vers la liste des réapprovisionnements...</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-3" size={20} />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-[#D4AF37] text-black px-6 py-4">
                <h2 className="text-lg font-bold">Formulaire d'attribution</h2>
                <p className="text-sm opacity-90">Remplissez les informations pour créer un nouveau réapprovisionnement</p>
              </div>

              <form onSubmit={submit} className="p-6 space-y-6">
                {/* Section produit */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="text-[#D4AF37]" size={20} />
                    <h3 className="font-semibold text-gray-800">Sélection du produit</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Produit <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={produitId} 
                        onChange={e => onProduitChange(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                        required
                      >
                        <option value="">-- Sélectionnez un produit --</option>
                        {produits.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nomProduit} (Stock: {p.quantiteProduit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {produitSelectionne && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{produitSelectionne.nomProduit}</p>
                            <p className="text-sm text-gray-600 mt-1">Stock actuel</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{produitStock}</p>
                            <p className="text-sm text-gray-500">unités disponibles</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section date */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="text-[#D4AF37]" size={20} />
                    <h3 className="font-semibold text-gray-800">Date du réapprovisionnement</h3>
                  </div>
                  
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={dateAttrib} 
                      onChange={e => setDateAttrib(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      required 
                    />
                  </div>
                </div>

                {/* Section zones */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="text-[#D4AF37]" size={20} />
                      <h3 className="font-semibold text-gray-800">Attribution par zone</h3>
                    </div>
                    <button 
                      type="button" 
                      onClick={addLine}
                      className="flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                    >
                      <Plus size={18} />
                      Ajouter une zone
                    </button>
                  </div>

                  {/* Résumé */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-blue-600">Stock disponible</p>
                        <p className="text-2xl font-bold text-blue-800">{produitStock}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-green-600">Total attribué</p>
                        <p className="text-2xl font-bold text-green-800">{totalAssigned}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Reste disponible</p>
                        <p className={`text-2xl font-bold ${remainingStock >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                          {remainingStock}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lignes */}
                  <div className="space-y-4">
                    {lines.map((line, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-gray-700">Zone #{idx + 1}</span>
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Zone <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                              <select 
                                value={line.zone_id || ''} 
                                onChange={e => updateLine(idx, 'zone_id', e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                              >
                                <option value="">-- Choisir une zone --</option>
                                {availableZonesForRow(idx).map(z => (
                                  <option key={z.id} value={z.id}>{z.nom}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setShowZoneModal(true)}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {!line.zone_id && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouvelle zone
                              </label>
                              <input
                                type="text"
                                value={line.nouvelle_zone || ''}
                                onChange={e => updateLine(idx, 'nouvelle_zone', e.target.value)}
                                placeholder="Nom de la nouvelle zone"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantité <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={produitStock}
                              value={line.quantite}
                              onChange={e => updateLine(idx, 'quantite', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.visit('/attribution/admin')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !produitId || lines.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-yellow-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Valider le réapprovisionnement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Modal */}
            {showZoneModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-4">Créer une nouvelle zone</h3>
                    <input
                      type="text"
                      value={nouvelleZoneNom}
                      onChange={e => setNouvelleZoneNom(e.target.value)}
                      placeholder="Nom de la zone"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
                      autoFocus
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowZoneModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => createZone(nouvelleZoneNom)}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-yellow-600 text-white rounded-lg"
                      >
                        Créer
                      </button>
                    </div>
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