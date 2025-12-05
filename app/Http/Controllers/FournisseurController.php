<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomFournisseur' => 'required|string|max:255',
            'contactTel' => 'nullable|string|max:20',
            'adresseMail' => 'nullable|email|max:255',
            'adresseBoutique' => 'nullable|string',
            'categorieProduit' => 'nullable|string|in:Alimentaire,Boissons,Épicerie,Produits frais,Matériel,Équipement,Services,Autres',
            'siteWeb' => 'nullable|url|max:255',
            'note' => 'nullable|integer|between:1,5'
        ]);

        $fournisseur = Fournisseur::create([
            'nom_fournisseur' => $validated['nomFournisseur'],
            'contact_tel' => $validated['contactTel'],
            'adresse_mail' => $validated['adresseMail'],
            'adresse_boutique' => $validated['adresseBoutique'],
            'categorie_produit' => $validated['categorieProduit'],
            'site_web' => $validated['siteWeb'],
            'note' => $validated['note']
        ]);

        return response()->json($fournisseur, 201);
    }

    // app/Http/Controllers/FournisseurController.php
public function index()
{
    return Fournisseur::all();
}

public function destroy($id)
{
    $fournisseur = Fournisseur::findOrFail($id);
    $fournisseur->delete();
    return response()->json(null, 204);
}

// Dans FournisseurController.php
public function show($id)
{
    $fournisseur = Fournisseur::find($id);
    
    if (!$fournisseur) {
        return response()->json([
            'success' => false,
            'message' => 'Fournisseur non trouvé'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $fournisseur
    ]);
}
public function import(Request $request)
{
    $request->validate([
        'data' => 'required|array',
        'data.*.nom_fournisseur' => 'required|string|max:255',
        'data.*.contact_tel' => 'nullable|integer|max:9999999999999999999',
        'data.*.adresse_mail' => 'nullable|email|max:255',
        'data.*.adresse_boutique' => 'nullable|string',
        'data.*.categorie_produit' => 'nullable|string|in:Alimentaire,Boissons,Épicerie,Produits frais,Matériel,Équipement,Services,Autres',
        'data.*.site_web' => 'nullable|max:255',
        'data.*.note' => 'nullable|integer|between:1,5'
    ]);

    $errors = [];
    $successCount = 0;

    foreach ($request->data as $index => $data) {
        try {
            Fournisseur::create([
                'nom_fournisseur' => $data['nom_fournisseur'],
                'contact_tel' => $data['contact_tel'],
                'adresse_mail' => $data['adresse_mail'],
                'adresse_boutique' => $data['adresse_boutique'],
                'categorie_produit' => $data['categorie_produit'],
                'site_web' => $data['site_web'],
                'note' => $data['note']
            ]);
            $successCount++;
        } catch (\Exception $e) {
            $errors["Ligne " . ($index + 1)] = ["Erreur lors de la création : " . $e->getMessage()];
        }
    }

    if (!empty($errors)) {
        return response()->json([
            'success' => false,
            'message' => count($errors) . ' erreur(s) lors de l\'importation',
            'errors' => $errors,
            'imported_count' => $successCount
        ], 422);
    }

    return response()->json([
        'success' => true,
        'message' => 'Tous les fournisseurs (' . $successCount . ') ont été importés avec succès',
        'imported_count' => $successCount
    ]);
}
}

//CAS 1
// 1. Imports - Ligne 1-6
// VERSION 1 - Avec Validator importé :
// use App\Models\Fournisseur;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;

// VERSION 2 - Sans Validator importé :
// use App\Models\Fournisseur;
// use Illuminate\Http\Request;

//CAS 2
// 2. Méthode store() - Ligne 10-11 - Validation de contactTel
// VERSION 1 - Validation integer :
// 'contactTel' => 'nullable|integer|max:9999999999999999999',

// VERSION 2 - Validation string avec longueur réduite :
// 'contactTel' => 'nullable|string|max:20',


//CAS 3
// 3. Méthode store() - Ligne 15 - Validation de siteWeb
// VERSION 1 - Validation basique :
// 'siteWeb' => 'nullable|max:255',

// VERSION 2 - Validation URL :
// 'siteWeb' => 'nullable|url|max:255',


//CAS 4
//4. Méthode store() - Ligne 32-37 - Type de retour php
// VERSION 1 - Retour redirect avec session flash :
// return redirect()->route('fournisseur.admin')->with([
//     'success' => 'Fournisseur créé avec succès!',
//     'fournisseur' => $fournisseur
// ]);

// VERSION 2 - Retour JSON avec statut 201 :
// return response()->json($fournisseur, 201);


//CAS 5
// 5. Méthode import() - Ligne 88 - Validation de contact_tel
// VERSION 1 - Validation integer (identique à store) :
// 'data.*.contact_tel' => 'nullable|integer|max:9999999999999999999',

// VERSION 2 - Validation integer (différente de store dans cette version) :
// 'data.*.contact_tel' => 'nullable|integer|max:9999999999999999999',

//CAS 6
// 6. Méthode import() - Ligne 92 - Validation de site_web
// VERSION 1 - Validation basique :
// 'data.*.site_web' => 'nullable|max:255',

// VERSION 2 - Validation basique (identique à V1, différente de store V2) :
// 'data.*.site_web' => 'nullable|max:255',

