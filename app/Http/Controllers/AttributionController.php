<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Produit;
use App\Models\ZoneAttribution;
use App\Models\Attribution;
use Illuminate\Validation\ValidationException;

class AttributionController extends Controller
{
    // Affiche la page avec produits minimal + zones
    public function index()
    {
        $produits = Produit::select('id', 'nomProduit', 'quantiteProduit')->orderBy('nomProduit')->get();
        $zones = ZoneAttribution::select('id', 'nom')->orderBy('nom')->get();


         $user = auth()->user();

    return Inertia::render('Admin/AttributionAdmin', [
        'produits' => $produits,
        'zones' => $zones,
        'user' => $user, // Ajoutez cette ligne
    ]);
    }

    // Crée une ou plusieurs lignes d'attribution
    public function store(Request $request)
    {
        $data = $request->validate([
            'produit_id' => 'required|exists:produit,id',
            'date_attribution' => 'required|date',
            'lines' => 'required|array|min:1',
            'lines.*.zone_id' => 'nullable|exists:zones_attribution,id',
            'lines.*.nouvelle_zone' => 'nullable|string|max:255',
            'lines.*.quantite' => 'required|integer|min:0',
        ]);

        // Récupérer le produit et sa quantité disponible
        $produit = Produit::findOrFail($data['produit_id']);
        $stock = (int) $produit->quantiteProduit;

        // Construire la liste finale des attributions et vérifier doublon de zone dans la requête
        $seenZones = [];
        $totalAttribue = 0;
        $finalLines = [];

        foreach ($data['lines'] as $line) {
            $zoneId = $line['zone_id'] ?? null;
            $newZoneName = $line['nouvelle_zone'] ?? null;

            if (!$zoneId && !$newZoneName) {
                throw ValidationException::withMessages(['lines' => 'Chaque ligne doit avoir une zone existante ou un nom de nouvelle zone.']);
            }

            // Si nouvelle zone, créer
            if ($newZoneName) {
                $zone = ZoneAttribution::create(['nom' => $newZoneName]);
                $zoneId = $zone->id;
            }

            // empêche duplication des zones dans la même soumission
            if (in_array($zoneId, $seenZones)) {
                throw ValidationException::withMessages(['lines' => 'Une même zone ne peut pas être sélectionnée deux fois.']);
            }
            $seenZones[] = $zoneId;

            $q = (int) $line['quantite'];
            $totalAttribue += $q;

            $finalLines[] = [
                'zone_id' => $zoneId,
                'quantite' => $q,
            ];
        }

        if ($totalAttribue > $stock) {
            throw ValidationException::withMessages(['lines' => 'La somme des quantités dépasse le stock disponible (' . $stock . ').']);
        }

        // Transaction: créer les attributions et mettre à jour le stock du produit (option)
        DB::transaction(function () use ($produit, $finalLines, $data) {
            foreach ($finalLines as $l) {
                Attribution::create([
                    'produit_id' => $produit->id,
                    'zone_id' => $l['zone_id'],
                    'quantite' => $l['quantite'],
                    'date_attribution' => $data['date_attribution'],
                ]);
            }

            // Déduire la quantité (optionnel) -- si tu veux garder stock à jour
            $sum = array_sum(array_column($finalLines, 'quantite'));
            $produit->quantiteProduit = max(0, (int)$produit->quantiteProduit - $sum);
            $produit->save();
        });

        return back()->with('success', 'Attributions enregistrées avec succès.');
    }

    // Quick create zone (AJAX) — renvoie la zone créée en JSON
    public function storeZone(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:zones_attribution,nom'
        ]);

        $zone = ZoneAttribution::create(['nom' => $validated['nom']]);

        return response()->json(['success' => true, 'zone' => $zone]);
    }

    public function getAttributions()
{
    $attributions = Attribution::with(['produit', 'zone'])
        ->orderBy('date_attribution')
        ->orderBy('created_at')
        ->get();

    return response()->json($attributions);
}

public function destroy($id)
{
    try {
        $attribution = Attribution::findOrFail($id);
        
        // Optionnel: remettre le stock
        $produit = $attribution->produit;
        if ($produit) {
            $produit->quantiteProduit += $attribution->quantite;
            $produit->save();
        }
        
        $attribution->delete();
        
        return back()->with('success', 'Attribution supprimée avec succès');
        
    } catch (\Exception $e) {
        return back()->with('error', 'Erreur lors de la suppression: ' . $e->getMessage());
    }
}

// Méthode pour afficher le formulaire
public function formulaire()
{
    $produits = Produit::select('id', 'nomProduit', 'quantiteProduit')->orderBy('nomProduit')->get();
    $zones = ZoneAttribution::select('id', 'nom')->orderBy('nom')->get();

    return Inertia::render('formulaire/formulaireAttribution', [ // Assurez-vous que c'est le bon nom de composant
        'produits' => $produits,
        'zones' => $zones,
    ]);
}
}
