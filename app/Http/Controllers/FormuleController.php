<?php

namespace App\Http\Controllers;

use App\Models\Formule;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FormuleController extends Controller
{
    /**
     * Liste toutes les formules avec les relations nécessaires
     */
    public function index()
    {
        $formules = Formule::with(['produit', 'ingredients'])
            ->select([
                'id',
                'nom_formule as nomFormule',
                'description',
                'produit_id',
                'instructions',
                'createur',
                'created_at as dateCreation'
            ])
            ->orderBy('created_at')
            ->get();

        return response()->json($formules);
    }

    /**
     * Crée une nouvelle formule avec produit associé et ingrédients
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nomFormule' => 'required|string|max:255',
            'description' => 'nullable|string',
            'produitFiniId' => 'required|exists:produit,id',
            'instructions' => 'nullable|string',
            'createur' => 'nullable|string|max:255',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredientId' => 'required|exists:ingredients,id',
            'ingredients.*.quantite' => 'required|numeric|min:0.01',
            'ingredients.*.unite' => 'required|string|max:10',
        ]);

        try {
            DB::beginTransaction();

            $formule = Formule::create([
                'nom_formule' => $validatedData['nomFormule'],
                'description' => $validatedData['description'] ?? null,
                'produit_id' => $validatedData['produitFiniId'],
                'instructions' => $validatedData['instructions'] ?? null,
                'createur' => $validatedData['createur'] ?? null,
            ]);

            $ingredientsData = [];
            foreach ($validatedData['ingredients'] as $ingredient) {
                $ingredientsData[$ingredient['ingredientId']] = [
                    'quantite' => $ingredient['quantite'],
                    'unite' => $ingredient['unite'],
                ];
            }

            $formule->ingredients()->attach($ingredientsData);

            DB::commit();

            return redirect()->route('produit')
            ->with('success', 'Formule créée avec succès!');
        }
         catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de la formule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime une formule et détache ses ingrédients
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $formule = Formule::findOrFail($id);
            $formule->ingredients()->detach();
            $formule->delete();

            DB::commit();

            return response()->json(['message' => 'Formule supprimée avec succès']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retourne les ingrédients d'une formule
     */
    public function getIngredients(Formule $formule)
    {
        try {
            $ingredients = $formule->ingredients()
                ->withPivot('quantite', 'unite')
                ->get();
            
            return response()->json($ingredients);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des ingrédients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Nouvelle méthode pour récupérer les formules d'un produit
     */
    public function getFormuleByProduit($produitId)
    {
        try {
            $formule = Formule::with('ingredients')
                ->where('produit_id', $produitId)
                ->firstOrFail();
            
            return response()->json($formule);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Aucune formule trouvée pour ce produit',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function show($id)
{
    try {
        $formule = Formule::with(['produit', 'ingredients'])->findOrFail($id);
        return response()->json($formule);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Formule non trouvée',
            'error' => $e->getMessage()
        ], 404);
    }
}

public function import(Request $request)
{
    $validator = Validator::make($request->all(), [
        'data' => 'required|array',
        'data.*.nom_formule' => 'required|string|max:100',
        'data.*.description' => 'nullable|string',
        'data.*.produit_id' => 'required|exists:produit,id',
        'data.*.instructions' => 'nullable|string',
        'data.*.createur' => 'nullable|string|max:100',
        'data.*.ingredients' => 'required|array|min:1',
        'data.*.ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
        'data.*.ingredients.*.quantite' => 'required|numeric|min:0.01',
        'data.*.ingredients.*.unite' => 'required|string|max:10'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation des données',
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        $importedCount = 0;
        $errors = [];

        foreach ($request->data as $index => $data) {
            try {
                // Créer la formule
                $formule = Formule::create([
                    'nom_formule' => $data['nom_formule'],
                    'description' => $data['description'] ?? null,
                    'produit_id' => $data['produit_id'],
                    'instructions' => $data['instructions'] ?? null,
                    'createur' => $data['createur'] ?? null,
                ]);

                // Préparer les ingrédients
                $ingredientsData = [];
                foreach ($data['ingredients'] as $ingredient) {
                    $ingredientsData[$ingredient['ingredient_id']] = [
                        'quantite' => $ingredient['quantite'],
                        'unite' => $ingredient['unite']
                    ];
                }

                // Associer les ingrédients
                $formule->ingredients()->attach($ingredientsData);

                $importedCount++;
            } catch (\Exception $e) {
                $errors["Formule " . ($index + 1)] = $e->getMessage();
            }
        }

        DB::commit();

        if (!empty($errors)) {
            return response()->json([
                'success' => false,
                'message' => 'Certaines formules n\'ont pas pu être importées',
                'imported_count' => $importedCount,
                'errors' => $errors
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Importation réussie',
            'imported_count' => $importedCount
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'importation',
            'error' => $e->getMessage()
        ], 500);
    }
}

}
//CAS 1
//1. Imports - Ligne 1-8
// VERSION 1 - Avec Validator importé :
// use App\Models\Formule;
// use App\Models\Produit;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Validator;

// VERSION 2 - Sans Validator importé :
// use App\Models\Formule;
// use App\Models\Produit;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;

//CAS 2
//2. Méthode index() - Ligne 19 - Ordre de tri
// VERSION 1 - Tri ascendant :
// ->orderBy('created_at', 'asc')

// VERSION 2 - Tri descendant :
// ->orderBy('created_at', 'desc')


//CAS 3
// 3. Méthode store() - Ligne 48-52 - Type de retour
// VERSION 1 - Retour redirect avec session flash :
// return redirect()->route('formules.admin')->with([
//     'success' => 'Formule créée avec succès',
//     'formule' => $formule->load(['produit', 'ingredients'])
// ]);

// // VERSION 2 - Retour JSON avec statut 201 :
// return response()->json([
//     'message' => 'Formule créée avec succès',
//     'formule' => $formule->load(['produit', 'ingredients'])
// ], 201);

//CAS 4
// 4. Méthode store() - Ligne 57 - Gestion d'erreur

// VERSION 1 - Retour back avec erreurs :
// return back()->withErrors([
//     'message' => 'Erreur lors de la création de la formule',
//     'error' => $e->getMessage()
// ]);

// VERSION 2 - Retour JSON avec statut 500 :
// return response()->json([
//     'message' => 'Erreur lors de la création de la formule',
//     'error' => $e->getMessage()
// ], 500);


//CAS 5
// Méthode import() - Ligne 161 - Appel à Validator
// VERSION 1 - Utilise Validator::make() (fonctionne car Validator est importé) :
// $validator = Validator::make($request->all(), [

// VERSION 2 - Utilise Validator::make() mais Validator n'est PAS importé :
// $validator = Validator::make($request->all(), [

//CAS 6
// 6. Méthode store() - Commentaires
// VERSION 1 - Pas de commentaire spécifique
// public function store(Request $request)

// VERSION 2 - Avec commentaire descriptif :
/**
 * Crée une nouvelle formule avec produit associé et ingrédients
 */
// public function store(Request $request)

//CAS 7
// 7. Méthode import() - Position dans le fichier
// VERSION 1 - import() vient APRÈS show() (ligne ~161)
// public function show($id) { ... }
// public function import(Request $request) { ... }

// VERSION 2 - import() vient APRÈS show() mais avec un espace différent (ligne ~161)
// public function show($id) { ... }

// public function import(Request $request) { ... }