<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Commande;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class AdminController extends Controller
{
    public function index()
    {
        // dd('Dashboard admin atteint ✅');
        $user = auth()->user();

        // Filtrage du rôle
        // if (!in_array($user->role, ['superadmin', 'employe'])) {
        //     return redirect('/')->with('warning', 'Accès refusé');
        // }
        if (!in_array($user->role, ['superadmin', 'employe'])) {
    return redirect()->route('dashboard')->with('warning', 'Accès refusé');
}


        return Inertia::render('Admin/Dashboard',  [
            'user' => $user
        ]);
    }
 
    public function accesUtilisateur()
{
    
    return Inertia::render('Admin/accesUtilisateurAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}

    public function client()
{

    return Inertia::render('Admin/clientAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
    public function rapport()
{

    return Inertia::render('Admin/rapportAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}

   public function historique()
{

    return Inertia::render('Admin/historiqueAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
   public function employes()
{

    return Inertia::render('Admin/employeAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
   public function produits()
{

    return Inertia::render('Admin/produitAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
   public function vente()
{

    return Inertia::render('Admin/venteAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
   public function ingredientLab()
{

    return Inertia::render('Admin/ingredientLab', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
   public function productions()
{

    return Inertia::render('Admin/productionAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
 public function fournisseur()
{

    return Inertia::render('Admin/fournisseurAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
 public function formules()
{

    return Inertia::render('Admin/formuleAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}
 public function reapprovisionnement()
{

    return Inertia::render('Admin/reapprovisionnementAdmin', [
        'user' => auth()->user(), // 👈 ici on passe l'utilisateur connecté
    ]); 
}

public function index1()
{
    $user = auth()->user();

    if (!in_array($user->role, ['superadmin', 'employe'])) {
        return redirect()->route('dashboard')->with('warning', 'Accès refusé');
    }

    $commandes = Commande::with(['client', 'produits'])
        ->orderBy('created_at')
        ->get()
        ->map(function ($cmd) {
            return [
                'id' => $cmd->idCommande,
                'display_id' => '#' . str_pad($cmd->idCommande, 3, '0', STR_PAD_LEFT),
                'date_commande' => $cmd->dateCommande,
                'nom_client' => $cmd->client->name ?? ($cmd->prenom_client . ' ' . $cmd->nom_client) ?? 'Inconnu',
                'email_client' => $cmd->client->email ?? 'N/A',
                'paiement' => $cmd->modePaiement ?? 'N/A',
                'montant' => number_format($cmd->montantTotal, 0, ',', ' ') . ' FCFA',
                'montant_numeric' => $cmd->montantTotal, // Pour les calculs
                'etat' => $cmd->statutCommande ?? 'En attente',
                'origine' => $cmd->origineCommande ?? 'N/A',
                'produits' => $cmd->produits->map(fn ($p) => [
                    'id' => $p->id,
                    'nom' => $p->nomProduit,
                    'quantite' => $p->pivot->quantite,
                    'prix_unitaire' => number_format($p->prixProduit, 0, ',', ' ') . ' FCFA',
                    'prix_unitaire_numeric' => $p->prixProduit, // Pour les calculs
                    'total_produit' => number_format($p->prixProduit * $p->pivot->quantite, 0, ',', ' ') . ' FCFA',
                    'total_produit_numeric' => $p->prixProduit * $p->pivot->quantite, // Pour les calculs
                ]),
            ];
        });

    return Inertia::render('Admin/commandesAdmin', [
        'user' => $user,
        'commandes' => $commandes
    ]);
}

public function clientStats(Request $request)
{
    // Base query pour les clients
    $query = DB::table('users')
        ->where('role', 'client');

    // Appliquer les filtres de date si fournis
    if ($request->has('start_date') && $request->start_date) {
        $query->whereDate('created_at', '>=', $request->start_date);
    }
    
    if ($request->has('end_date') && $request->end_date) {
        $query->whereDate('created_at', '<=', $request->end_date);
    }

    // Si aucune date n'est spécifiée, on prend la semaine en cours par défaut
    if (!$request->has('start_date') && !$request->has('end_date')) {
        $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    // Récupérer les statistiques par jour
    $stats = $query->selectRaw('DAYNAME(created_at) as jour, COUNT(*) as clients')
        ->groupBy('jour')
        ->orderByRaw('FIELD(jour, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")')
        ->get();

    // Formatage des jours en français
    $joursFrancais = [
        'Monday' => 'Lundi',
        'Tuesday' => 'Mardi',
        'Wednesday' => 'Mercredi',
        'Thursday' => 'Jeudi',
        'Friday' => 'Vendredi',
        'Saturday' => 'Samedi',
        'Sunday' => 'Dimanche',
    ];

    $stats = $stats->map(function ($item) use ($joursFrancais) {
        return [
            'jour' => $joursFrancais[$item->jour] ?? $item->jour,
            'clients' => $item->clients,
        ];
    });

    // Pour avoir toujours tous les jours (avec 0 si aucun client)
    $allDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    $statsArray = $stats->keyBy('jour');

    $finalStats = [];
    foreach ($allDays as $day) {
        $finalStats[] = [
            'jour' => $day,
            'clients' => $statsArray->has($day) ? $statsArray[$day]['clients'] : 0,
        ];
    }

    return response()->json($finalStats);
}

public function updateStatut(Request $request, $id)
{
    $request->validate([
        'statut' => 'required|in:en_attente,payée,expédiée,livrée,annulée'
    ]);

    $commande = Commande::findOrFail($id);
    $commande->statutCommande = $request->statut;
    $commande->save();

    return response()->json([
        'message' => 'Statut mis à jour avec succès',
        'commande' => [
            'id' => $commande->idCommande,
            'display_id' => '#CMD-' . str_pad($commande->idCommande, 3, '0', STR_PAD_LEFT),
            'statut' => $commande->statutCommande
        ]
    ]);
}

public function showDetails($id)
{
    try {
        $commande = Commande::with(['client', 'produits'])->findOrFail($id);

        // Conversion sécurisée de la date
        $dateCommande = $commande->dateCommande;
        if (is_string($dateCommande)) {
            try {
                $dateCommande = \Carbon\Carbon::parse($dateCommande)->toISOString();
            } catch (\Exception $e) {
                $dateCommande = $commande->created_at->toISOString();
            }
        } elseif ($dateCommande instanceof \Carbon\Carbon) {
            $dateCommande = $dateCommande->toISOString();
        } else {
            $dateCommande = $commande->created_at->toISOString();
        }

        $data = [
            'id' => $commande->idCommande,
            'display_id' => '#' . str_pad($commande->idCommande, 3, '0', STR_PAD_LEFT),
            'nom_client' => $commande->client->name ?? 'Client inconnu',
            'paiement' => $commande->modePaiement ?? 'N/A',
            'montant' => number_format($commande->montantTotal, 0, ',', ' ') . ' FCFA',
            'etat' => $commande->statutCommande ?? 'En attente',
            'date_commande' => $dateCommande,
            'adresse_livraison' => $commande->adresseLivraison,
            'commentaire' => $commande->commentaire,
            'origine' => $commande->origineCommande,
            'produits' => $commande->produits->map(function ($p) {
                return [
                    'nom' => $p->nomProduit,
                    'quantite' => $p->pivot->quantite,
                    'prix' => number_format($p->prixProduit, 0, ',', ' ') . ' FCFA', // Prix actuel du produit
                    'prix_unitaire_numeric' => $p->prixProduit, // Utilisez le prix actuel pour les calculs
                ];
            }),
            'client' => [
                'email' => $commande->client->email ?? '',
                'telephone' => $commande->client->telephone ?? '',
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    } catch (\Exception $e) {
        \Log::error('Erreur détail commande:', ['error' => $e->getMessage(), 'trace' => $e->getTrace()]);

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des détails',
            'error' => $e->getMessage()
        ], 500);
    }
}
}

//CAS 1
// VERSION 1 - Tri ascendant :
//$commandes = Commande::with(['client', 'produits'])
//    ->orderBy('created_at', 'asc')
//    ->get()

// VERSION 2 - Tri descendant :
//$commandes = Commande::with(['client', 'produits'])
//    ->orderByDesc('created_at')
//    ->get()


//CAS 2
// VERSION 1 - Format simple avec idCommande :
//'id' => $cmd->idCommande,
//'display_id' => '#' . str_pad($cmd->idCommande, 3, '0', STR_PAD_LEFT),

// VERSION 2 - Format avec préfixe et id simple :
//'id' => '#CMD-' . str_pad($cmd->id, 3, '0', STR_PAD_LEFT),


//CAS 3
// VERSION 1 - Fallback simple :
//'nom_client' => $cmd->client->name ?? 'Client inconnu',

// VERSION 2 - Fallback étendu :
//'nom_client' => $cmd->client->name ?? ($cmd->prenom_client . ' ' . $cmd->nom_client) ?? 'Inconnu',


//CAS 4
// VERSION 1 - Structure étendue :
//return [
//    'id' => $cmd->idCommande,
//    'display_id' => '#' . str_pad($cmd->idCommande, 3, '0', STR_PAD_LEFT),
//    'nom_client' => $cmd->client->name ?? 'Client inconnu',
//    'paiement' => $cmd->modePaiement ?? 'N/A',
//    'montant' => number_format($cmd->montantTotal, 0, ',', ' ') . ' FCFA',
//    'etat' => $cmd->statutCommande ?? 'En attente',
//    'date_commande' => $dateValue,
//    'adresse_livraison' => $cmd->adresseLivraison,
//    'commentaire' => $cmd->commentaire,
//    'origine' => $cmd->origineCommande,
//    'produits' => $cmd->produits->map(fn ($p) => [
//        'id' => $p->id,
//        'nom' => $p->nomProduit,
//        'quantite' => $p->pivot->quantite,
//        'prix' => number_format($p->prixProduit, 0, ',', ' ') . ' FCFA',
//        'prix_unitaire_numeric' => $p->prixProduit
//    ]),
//]

// VERSION 2 - Structure simplifiée :
// return [
//     'id' => '#CMD-' . str_pad($cmd->id, 3, '0', STR_PAD_LEFT),
//     'nom_client' => $cmd->client->name ?? ($cmd->prenom_client . ' ' . $cmd->nom_client) ?? 'Inconnu',
//     'paiement' => $cmd->modePaiement ?? 'N/A',
//     'montant' => number_format($cmd->montantTotal, 0, ',', ' ') . ' FCFA',
//     'etat' => $cmd->statutCommande ?? 'En attente',
//     'produits' => $cmd->produits->map(fn ($p) => [
//         'nom' => $p->nomProduit,
//         'quantite' => $p->pivot->quantite,
//         'prix' => number_format($p->prixProduit, 0, ',', ' ') . ' FCFA',
//     ]),
// ]


//CAS 5
// VERSION 1 - showDetails() vient AVANT clientStats() (ligne 148)
// public function showDetails($id)
// {
    // ... code
//}

//public function clientStats(Request $request)
//{
    // ... code
//}

// VERSION 2 - showDetails() vient APRÈS updateStatut() (ligne 193)
//public function updateStatut(Request $request, $id)
//{
    // ... code
//}

//public function showDetails($id)
//{
    // ... code
//}



//CAS 6
// 6. Méthode showDetails() - Ligne 156 vs 200 - ID de commande
// php
// VERSION 1 - Utilise idCommande :
// 'id' => $commande->idCommande,
// 'display_id' => '#' . str_pad($commande->idCommande, 3, '0', STR_PAD_LEFT),

// VERSION 2 - Même code mais position différente


//CAS 7
// 7. Champs manquants dans la Version 2
// La Version 2 dans index1() ne retourne pas :

// date_commande

// adresse_livraison

// commentaire

// origine

// id dans les produits

// prix_unitaire_numeric dans les produits


//CAS 8
// 8. Traitement de date dans Version 1
// La Version 1 a un traitement de date spécifique qui n'existe pas dans la Version 2 pour index1() :

// php
// try {
//     $dateValue = $cmd->dateCommande 
//         ? \Carbon\Carbon::parse($cmd->dateCommande)->toISOString()
//         : $cmd->created_at->toISOString();
// } catch (\Exception $e) {
//     $dateValue = $cmd->created_at->toISOString();
// }