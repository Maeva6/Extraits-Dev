<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Formule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{

    public function index()
    {
        try {
            $productions = Production::with([
                'produit' => function($query) {
                    $query->select('id', 'nomProduit');
                },
                'formule' => function($query) {
                    $query->select('id', 'nom_formule', 'produit_id');
                },
                'ingredients' => function($query) {
                    $query->select('ingredients.id', 'ingredients.nomIngredient')
                          ->withPivot('quantite_utilisee', 'unite');
                }
            ])
            ->orderBy('created_at', 'asc')
            ->get();

            return response()->json($productions);

        } catch (\Exception $e) {
            Log::error('Error fetching productions:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erreur lors de la récupération des productions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

public function store(Request $request)
{
    \Log::info('Request data:', $request->all());

    $validated = $request->validate([
        'formule_id' => 'required|exists:formules,id',
        'quantite' => 'required|integer|min:1',
        'ingredients_utilises' => 'required|array|min:1',
        'ingredients_utilises.*.ingredient_id' => 'required|exists:ingredients,id',
        'ingredients_utilises.*.quantite_utilisee' => 'required|numeric|min:0.01',
        'ingredients_utilises.*.unite' => 'required|string|max:20'
    ]);

    try {
        DB::beginTransaction();

        // Charger la formule avec son produit associé
        $formule = Formule::with('produit')->findOrFail($validated['formule_id']);
        
        // Vérifier que le produit existe
        if (!$formule->produit) {
            throw new \Exception('Aucun produit associé à cette formule');
        }

        // 1. Mettre à jour le stock du produit final
        $formule->produit->increment('quantiteProduit', $validated['quantite']);

        // 2. Mettre à jour les stocks des ingrédients
        foreach ($validated['ingredients_utilises'] as $ingredient) {
            DB::table('ingredients')
                ->where('id', $ingredient['ingredient_id'])
                ->decrement('stockActuel', $ingredient['quantite_utilisee']);
        }

        // 3. Créer l'enregistrement de production
        $production = Production::create([
            'formule_id' => $formule->id,
            'produit_id' => $formule->produit_id,
            'quantite_produite' => $validated['quantite']
        ]);

        // 4. Enregistrer les ingrédients utilisés
        $ingredientsData = [];
        foreach ($validated['ingredients_utilises'] as $ingredient) {
            $ingredientsData[$ingredient['ingredient_id']] = [
                'quantite_utilisee' => $ingredient['quantite_utilisee'],
                'unite' => $ingredient['unite']
            ];
        }

        $production->ingredients()->attach($ingredientsData);

        DB::commit();

        // REDIRECTION VERS LA PAGE DES PRODUCTIONS
        return redirect('/productions/admin')->with('success', 'Production lancée avec succès!');

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error during production creation:', ['error' => $e->getMessage()]);
        
        // Redirection avec erreur
        return back()->withErrors([
            'message' => 'Erreur lors de l\'enregistrement de la production',
            'error' => $e->getMessage()
        ]);
    }
}

    public function destroy($id)
{
    try {
        DB::beginTransaction();

        $production = Production::with(['produit', 'ingredients'])->findOrFail($id);

        // Restaurer le stock du produit
        $production->produit->decrement('quantiteProduit', $production->quantite_produite);

        // Restaurer les stocks des ingrédients
        foreach ($production->ingredients as $ingredient) {
            $ingredient->increment('stockActuel', $ingredient->pivot->quantite_utilisee);
        }

        // Supprimer les relations
        $production->ingredients()->detach();

        // Supprimer la production
        $production->delete();

        DB::commit();

        return response()->json([
            'message' => 'Production supprimée avec succès'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Error during production deletion:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Erreur lors de la suppression',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function show($id)
{
    try {
        $production = Production::with([
            'produit' => function($query) {
                $query->select('id', 'nomProduit', 'categorie_id')
                      ->with('categorie:id,name'); // CHARGER LA CATÉGORIE
            },
            'formule' => function($query) {
                $query->select('id', 'nom_formule', 'produit_id');
            },
            'ingredients' => function($query) {
                $query->select('ingredients.id', 'ingredients.nomIngredient', 'ingredients.categorie')
                      ->withPivot('quantite_utilisee', 'unite');
            }
        ])->findOrFail($id);

        // DEBUG: Log pour vérifier les données
        \Log::info('Production data:', [
            'production_id' => $production->id,
            'produit' => $production->produit ? [
                'id' => $production->produit->id,
                'nomProduit' => $production->produit->nomProduit,
                'categorie_id' => $production->produit->categorie_id,
                'categorie' => $production->produit->categorie,
            ] : null
        ]);

        return response()->json($production);

    } catch (\Exception $e) {
        \Log::error('Error fetching production:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Erreur lors de la récupération de la production',
            'error' => $e->getMessage()
        ], 500);
    }
}
    
}

//CAS 1
//Changements dans la méthode store()
//Dans la version 1
// public function store(Request $request)
// {
    // ... validation et logique identique ...

    // Retour Inertia avec redirection
    // return redirect()->route('productions.admin')->with([
    //     'success' => 'Production lancée avec succès!',
    //     'production' => $production->load('produit', 'ingredients')
    // ]);

    // ... gestion d'erreur avec back() ...
//     return back()->withErrors([
//         'message' => 'Erreur lors de l\'enregistrement',
//         'error' => $e->getMessage()
//     ]);
// }

//Dans la version 2
// public function store(Request $request)
// {
    // ... validation et logique identique ...

    // Retour JSON pour API
    // return response()->json([
    //     'message' => 'Production enregistrée avec succès',
    //     'data' => $production->load('produit', 'ingredients')
    // ], 201);

    // ... gestion d'erreur avec response JSON ...
//     return response()->json([
//         'message' => 'Erreur lors de l\'enregistrement',
//         'error' => $e->getMessage()
//     ], 500);
// }