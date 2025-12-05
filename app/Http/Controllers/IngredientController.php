<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use App\Models\Reapprovisionnement;
use Illuminate\Support\Facades\Validator;

class IngredientController extends Controller
{
    public function index()
    {
        $ingredients = Ingredient::select([
            'id', 
            'nomIngredient', 
            'description', 
            'fournisseur', 
            'stockActuel', 
            'prix', 
            'seuilAlerte', 
            'categorie', 
            'photo', 
            'etat_physique', 
            'created_at', 
            'updated_at'  
        ])
        ->orderBy('id') 
        ->get();
        
        return response()->json($ingredients);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nomIngredient' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fournisseur' => 'required|string|max:255',
            'stockActuel' => 'required|integer',
            'prix' => 'required|numeric',
            'seuilAlerte' => 'required|integer',
            'categorie' => 'required|string|max:255',
            'photo' => 'nullable|string',
            'etat_physique' => 'required|in:liquide,solide,gazeux',
        ]);

        Ingredient::create($validatedData);

        return redirect()->route('ingredient.lab')   // ou ->to('/ingredients')
                        ->with('success', 'Ingrédient créé avec succès');
    }


    public function reapprovisionner(Request $request, $id)
    {
        $request->validate([
            'quantiteAjoutee' => 'required|integer|min:1',
        ]);

        $ingredient = Ingredient::findOrFail($id);
        $ingredient->stockActuel += $request->quantiteAjoutee;
        $ingredient->save();

        Reapprovisionnement::create([
            'ingredient_id' => $ingredient->id,
            'quantite_ajoutee' => $request->quantiteAjoutee,
            'date_reapprovisionnement' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Stock mis à jour avec succès']);
    }

    public function list()
    {
        return response()->json(
            Ingredient::select('id', 'nomIngredient as name', 'photo')
                ->orderBy('nomIngredient')
                ->get()
                ->map(function ($ingredient) {
                    return [
                        'id' => $ingredient->id,
                        'name' => $ingredient->name,
                        'image' => $ingredient->photo
                    ];
                })
        );
    }

    public function show($id)
    {
        $ingredient = Ingredient::find($id);
        
        if (!$ingredient) {
            return response()->json(['message' => 'Ingredient not found'], 404);
        }
        
        // Récupérer les informations détaillées du fournisseur
        $fournisseurInfo = null;
        if ($ingredient->fournisseur) {
            // Rechercher le fournisseur par nom
            $fournisseur = Fournisseur::where('nom_fournisseur', $ingredient->fournisseur)->first();
            
            if ($fournisseur) {
                $fournisseurInfo = [
                    'id' => $fournisseur->id,
                    'nom_fournisseur' => $fournisseur->nom_fournisseur,
                    'contact_tel' => $fournisseur->contact_tel,
                    'adresse_mail' => $fournisseur->adresse_mail,
                    'adresse_boutique' => $fournisseur->adresse_boutique,
                    'categorie_produit' => $fournisseur->categorie_produit,
                    'site_web' => $fournisseur->site_web,
                    'note' => $fournisseur->note
                ];
            } else {
                // Si le fournisseur n'est pas trouvé dans la table fournisseurs,
                // on retourne juste le nom du fournisseur
                $fournisseurInfo = [
                    'nom_fournisseur' => $ingredient->fournisseur,
                    'contact_tel' => null,
                    'adresse_mail' => null,
                    'adresse_boutique' => null,
                    'categorie_produit' => null,
                    'site_web' => null,
                    'note' => null
                ];
            }
        }
        
        return response()->json([
            'id' => $ingredient->id,
            'nomIngredient' => $ingredient->nomIngredient,
            'description' => $ingredient->description,
            'fournisseur' => $ingredient->fournisseur,
            'fournisseur_info' => $fournisseurInfo,
            'stockActuel' => $ingredient->stockActuel,
            'prix' => $ingredient->prix,
            'seuilAlerte' => $ingredient->seuilAlerte,
            'categorie' => $ingredient->categorie,
            'photo' => $ingredient->photo_url,
            'etat_physique' => $ingredient->etat_physique,
            'created_at' => $ingredient->created_at,
            'updated_at' => $ingredient->updated_at
        ]);
    }

    public function import(Request $request)
    {
        $importData = $request->json()->all();
        $errors = [];
        $successCount = 0;
    
        foreach ($importData as $index => $ingredientData) {
            // Normalisation des noms de champs
            $data = [
                'nomIngredient' => $ingredientData['Nom de l\'ingrédient'] ?? $ingredientData['nomIngredient'] ?? null,
                'description' => $ingredientData['Description'] ?? $ingredientData['description'] ?? null,
                'fournisseur' => $ingredientData['Fournisseur'] ?? $ingredientData['fournisseur'] ?? null,
                'stockActuel' => $ingredientData['Stock Actuel'] ?? $ingredientData['stockActuel'] ?? null,
                'prix' => $ingredientData['Prix'] ?? $ingredientData['prix'] ?? null,
                'seuilAlerte' => $ingredientData['Seuil d\'alerte'] ?? $ingredientData['seuilAlerte'] ?? null,
                'categorie' => $ingredientData['Catégorie'] ?? $ingredientData['categorie'] ?? null,
                'photo' => $ingredientData['Photo'] ?? $ingredientData['photo'] ?? null,
                'etat_physique' => strtolower($ingredientData['État physique'] ?? $ingredientData['etat_physique'] ?? null),
            ];

            // Conversion des types numériques
            if (isset($data['stockActuel'])) {
                $data['stockActuel'] = intval($data['stockActuel']);
            }
            if (isset($data['prix'])) {
                $data['prix'] = floatval($data['prix']);
            }
            if (isset($data['seuilAlerte'])) {
                $data['seuilAlerte'] = intval($data['seuilAlerte']);
            }

            $validator = Validator::make($data, [
                'nomIngredient' => 'required|string|max:255',
                'description' => 'nullable|string',
                'fournisseur' => 'required|string|max:255',
                'stockActuel' => 'required|integer|min:0',
                'prix' => 'required|numeric|min:0',
                'seuilAlerte' => 'required|integer|min:0',
                'categorie' => 'required|string|max:255',
                'photo' => 'nullable|string',
                'etat_physique' => 'required|in:liquide,solide,gazeux',
            ]);

            if ($validator->fails()) {
                $errors["Ligne " . ($index + 1)] = $validator->errors()->all();
                continue;
            }

            try {
                // Vérifier si l'ingrédient existe déjà
                $existingIngredient = Ingredient::where('nomIngredient', $data['nomIngredient'])->first();
                
                if ($existingIngredient) {
                    // Mettre à jour l'ingrédient existant
                    $existingIngredient->update($data);
                } else {
                    // Créer un nouvel ingrédient
                    Ingredient::create($data);
                }
                
                $successCount++;
            } catch (\Exception $e) {
                $errors["Ligne " . ($index + 1)] = ["Erreur lors de la création : " . $e->getMessage()];
            }
        }

        $errorCount = count($errors);
        $response = [
            'success' => $errorCount === 0,
            'imported_count' => $successCount,
            'error_count' => $errorCount,
        ];

        if ($errorCount > 0) {
            $response['message'] = $errorCount . ' erreur(s) lors de l\'importation';
            $response['errors'] = $errors;
            return response()->json($response, 422);
        }

        return response()->json([
            'message' => 'Tous les ingrédients (' . $successCount . ') ont été importés avec succès'
        ]);
    }

    public function update(Request $request, $id)
    {
        $ingredient = Ingredient::findOrFail($id);

        $validatedData = $request->validate([
            'nomIngredient' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'fournisseur' => 'sometimes|required|string|max:255',
            'stockActuel' => 'sometimes|required|integer|min:0',
            'prix' => 'sometimes|required|numeric|min:0',
            'seuilAlerte' => 'sometimes|required|integer|min:0',
            'categorie' => 'sometimes|required|string|max:255',
            'photo' => 'nullable|string',
            'etat_physique' => 'sometimes|required|in:liquide,solide,gazeux',
        ]);

        $ingredient->update($validatedData);

        return response()->json([
            'message' => 'Ingredient updated successfully',
            'ingredient' => $ingredient
        ]);
    }

    public function destroy($id)
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();

        return response()->json(['message' => 'Ingredient deleted successfully']);
    }

    public function getByCategory($category)
    {
        $ingredients = Ingredient::where('categorie', $category)
            ->select('id', 'nomIngredient', 'stockActuel', 'prix', 'photo')
            ->orderBy('nomIngredient')
            ->get();

        return response()->json($ingredients);
    }

    public function getLowStock()
    {
        $ingredients = Ingredient::whereRaw('stockActuel < seuilAlerte')
            ->orWhere('stockActuel', 0)
            ->select('id', 'nomIngredient', 'stockActuel', 'seuilAlerte', 'categorie')
            ->orderBy('stockActuel', 'asc')
            ->get();

        return response()->json($ingredients);
    }

    public function search(Request $request)
    {
        $searchTerm = $request->query('q');

        if (!$searchTerm) {
            return response()->json([]);
        }

        $ingredients = Ingredient::where('nomIngredient', 'like', "%{$searchTerm}%")
            ->orWhere('categorie', 'like', "%{$searchTerm}%")
            ->orWhere('fournisseur', 'like', "%{$searchTerm}%")
            ->select('id', 'nomIngredient', 'categorie', 'stockActuel', 'prix', 'photo')
            ->orderBy('nomIngredient')
            ->limit(10)
            ->get();

        return response()->json($ingredients);
    }
}