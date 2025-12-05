<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\RecommendationController;
use App\Models\Produit;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Profile\PasswordController;
// use App\Http\Controllers\UserController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\FormuleController;
use App\Http\Controllers\ReapprovisionnementController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\PanierController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\AccessoireController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\LocalisationController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\AttributionController;
use App\Models\Attribution;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth'])->group(function () {
//profile
 Route::inertia('/mes-favoris', 'FavoritesPage')->name('favorites');
    Route::get('/mes-favoris', [FavoriteController::class, 'index'])->middleware('auth');

    Route::get('/user-dashboard', [CommandeController::class, 'dashboard'])->name('user.dashboard');


    Route::get('/checkout', fn () => Inertia::render('Checkout'))->name('checkout');
    Route::post('/orders', [CommandeController::class, 'store'])->name('orders.store');
    Route::delete('/ordersCommande/{id}', [CommandeController::class, 'destroy'])->name('ordersCommande.destroy');
    Route::get('/mes-commandes', [CommandeController::class, 'index'])->name('orders.index');

//quizz
 Route::get('/find-my-fragrance', fn () => Inertia::render('FragranceQuizStep1'))->name('quiz');
    Route::get('/fragrance-step2-homme', fn () => Inertia::render('FragranceQuizStep2Homme'))->name('quiz');
Route::get('/quiz/ingredients', fn () => Inertia::render('FragranceQuizStep2'));
Route::get('/quiz/senteurs', fn () => Inertia::render('FragranceQuizStep3'))->name('quiz.senteurs');
Route::get('/quiz/senteurs-homme', fn () => Inertia::render('FragranceQuizStep2Homme'))->name('quiz.senteurs');
Route::get('/quiz/ingredients-data', [IngredientController::class, 'list'])->name('quiz.ingredients.data');
Route::get('/quiz/step4', function () {
    return Inertia::render('FragranceQuizStep4');
});
Route::get('/quiz/step4/homme', function () {
    return Inertia::render('FragranceQuizStep4-homme');
});
Route::get('/quiz/step3-homme', function () {
    return Inertia::render('FragranceQuizStep3-homme');
});
Route::get('/quiz/step5', function (\Illuminate\Http\Request $request) {
    return Inertia::render('FragranceQuizStep5', [
        'selectedSex' => $request->selectedSex,
        'scentType' => $request->scentType,
        'mood' => $request->mood,
        'vibe' => $request->vibe,
    ]);
});
Route::get('/quiz/step5-homme', function (\Illuminate\Http\Request $request) {
    return Inertia::render('FragranceQuizStep5-homme', [
        'selectedSex' => $request->selectedSex,
        'scentType' => $request->scentType,
        'mood' => $request->mood,
        'vibe' => $request->vibe,
    ]);
    });

    //senteurs
    Route::get('/famille/parfums-de-corps', [ProduitController::class, 'parfumsDeCorps']);
Route::get('/body-perfume', [ProductController::class, 'bodyPerfume'])->name('body.perfume');
Route::get('/product/{id}', [ProductController::class, 'show'])->name('product.show');
Route::get('/famille/parfums-dambiance', [ProductController::class, 'homeFragrance']);
Route::get('/famille/accessoires', [AccessoireController::class, 'index'])->name('accessoires.index');
Route::get('/accessoire/{slug}', [AccessoireController::class, 'show'])->name('accessoire.show');
Route::get('/quiz/resultat', [RecommendationController::class, 'result']);
Route::get('/quiz/fragrance-result', fn () => Inertia::render('FragranceQuizStepfinal'));
Route::get('/quiz/ingredients', fn () => Inertia::render('FragranceQuizStep2'));
Route::get('/quiz/senteurs', fn () => Inertia::render('FragranceQuizStep3'))->name('quiz.senteurs');
Route::get('/quiz/senteurs-homme', fn () => Inertia::render('FragranceQuizStep2Homme'))->name('quiz.senteurs');
Route::get('/famille/parfums-dambiance', fn () => Inertia::render('HomeFragrance'))->name('senteurs');
Route::get('/famille/parfums-de-corps', fn () => Inertia::render('BodyPerfume'))->name('senteurs');
Route::get('/famille/cosmetiques', fn () => Inertia::render('Cosmetiques'))->name('senteurs');
Route::get('/services/gift-set', fn () => Inertia::render('SpecialGiftSet'))->name('senteurs');

//about && contact
Route::get('/notre-histoire', fn () => Inertia::render('About'))->name('about');
Route::get('/contact', fn () => Inertia::render('Contact'))->name('contact');
});
Route::get('/pages/pagesLab/ingredientLab', fn () => Inertia::render('ingredientLab'))->name('quiz');

Route::middleware('auth')->group(function () {
    Route::post('/ingredients', [IngredientController::class, 'store']);
});
//Recuperer les elements de la table ingredients a fin de les afficher
// Route::get('/quiz/ingredients-data', [IngredientController::class, 'index']);
// Route::put('/ingredients/{id}/reapprovisionner', [IngredientController::class, 'reapprovisionner']);
// Route::get('/ingredients/{id}', [IngredientController::class, 'show']);



Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard-admin', function () {
        $user = Auth::user();

        if (!in_array($user->role, ['superadmin', 'administrateur', 'employe'])) {
            abort(403);
        }

        return Inertia::render('Admin/Dashboard', [
            'user' => $user,
        ]);
    })->name('admin.dashboard');
});
Route::middleware(['auth'])->get('/admin/client-stats', [AdminController::class, 'clientStats'])->name('admin.client-stats');

Route::middleware(['auth'])->get('/dashboard', function () {
    $user = Auth::user();
    if (in_array($user->role, ['superadmin', 'administrateur', 'employe'])) {
        return redirect('/dashboard-admin');
    }

    return Inertia::render('Dashboard');
})->name('dashboard');

Route::middleware(['auth'])->group(function () {
    Route::get('/commandes/admin', [AdminController::class, 'index1']);
    Route::post('/admin/commandes', [CommandeController::class, 'store']);
    Route::put('/commandes/{id}/statut', [CommandeController::class, 'updateStatus'])->name('commandes.updateStatus');
    Route::get('/commandes/{id}/details', [AdminController::class, 'showDetails']);

    
Route::get('/formulairecommande/admin', [CommandeController::class, 'create'])->name('commande.create');
Route::get('/produits/admin', fn () => Inertia::render('Admin/produitAdmin'))->name('produit');
Route::get('/formulaireproduit/admin', fn () => Inertia::render('formulaire/formulaireProduit'))->name('produit');

Route::get('/ingredients/admin', fn () => Inertia::render('Admin/ingredientLab'))->name('produit');
Route::get('/formulaireingredient/admin', fn () => Inertia::render('formulaire/formulaireIngredients'))->name('produit');

Route::get('/fournisseurs/admin', fn () => Inertia::render('Admin/fournisseurAdmin'))->name('produit');
Route::get('/formulairefournisseur/admin', fn () => Inertia::render('formulaire/formulaireFournisseur'))->name('produit');

Route::get('/formules/admin', fn () => Inertia::render('Admin/formuleAdmin'))->name('produit');
Route::get('/formulaireformule/admin', fn () => Inertia::render('formulaire/formulaireFormule'))->name('produit');

Route::get('/reapprovisionnements/admin', fn () => Inertia::render('Admin/reapprovisionnementAdmin'))->name('produit');
Route::get('/formulairereapprovisionnment/admin', fn () => Inertia::render('formulaire/formulaireReapprovisionnementIngredient'))->name('produit');

Route::get('/ventes/admin', fn () => Inertia::render('Admin/venteAdmin'))->name('produit');

Route::get('/employes/admin', fn () => Inertia::render('Admin/employeAdmin'))->name('produit');

Route::get('/clients/admin', fn () => Inertia::render('Admin/clientAdmin'))->name('clients.admin');

Route::get('/historique/admin', fn () => Inertia::render('Admin/historiqueAdmin'))->name('produit');

Route::get('/rapport/admin', fn () => Inertia::render('Admin/rapportAdmin'))->name('produit');

Route::get('/accesutilisateur/admin', fn () => Inertia::render('Admin/accesUtilisateurAdmin'))->name('produit');

Route::get('/productions/admin', fn () => Inertia::render('Admin/productionAdmin'))->name('produit');
Route::get('/formulaireproduction/admin', fn () => Inertia::render('formulaire/formulaireProduction'))->name('produit');

Route::get('/formulaireclient/admin', fn () => Inertia::render('formulaire/formulaireClient'))->name('produit');
});

Route::middleware('api')->prefix('')->group(function () {
    // Produits
    Route::get('produits', [ProduitController::class, 'index']);
    Route::get('produits/{id}', [ProduitController::class, 'show']);
    Route::post('produits', [ProduitController::class, 'store']);
    Route::put('produits/{id}', [ProduitController::class, 'update']);
    Route::delete('produits/{id}', [ProduitController::class, 'destroy']);
    Route::get('produits/search', [ProduitController::class, 'search']);
    
    // Catégories
    Route::get('categories', [CategorieController::class, 'index']);
    Route::post('categories', [CategorieController::class, 'store']);
});
//API pour les ingredients
Route::middleware('api')->group(function () {
    Route::post('/ingredients', [IngredientController::class, 'store']);
});
//Recuperer les elements de la table ingredients a fin de les afficher
Route::get('/ingredients', [IngredientController::class, 'index']);
Route::put('/ingredients/{id}/reapprovisionner', [IngredientController::class, 'reapprovisionner']);
Route::get('/ingredients/{id}', [IngredientController::class, 'show']);

//POUR les fournisseurs
Route::post('/fournisseurs', [FournisseurController::class, 'store']);
Route::get('/fournisseurs', [FournisseurController::class, 'index']);
Route::delete('/fournisseurs/{id}', [FournisseurController::class, 'destroy']);
Route::get('/fournisseurs/{id}', [FournisseurController::class, 'show']);

//Pour les formules: 
Route::post('/formules', [FormuleController::class, 'store']);
Route::get('/formules', [FormuleController::class, 'index']);
Route::get('/formules/{id}', [FormuleController::class, 'show']);
// suppression d'une formule (nécessaire pour axios.delete)
Route::delete('/formules/{id}', [FormuleController::class, 'destroy'])->name('formules.destroy')->middleware('auth');


//API pour reapprovisionnements
Route::get('/reapprovisionnements', [ReapprovisionnementController::class, 'index']);
Route::get('/reapprovisionnements/{id}', [ReapprovisionnementController::class, 'show']);
Route::delete('/reapprovisionnements/{id}', [ReapprovisionnementController::class, 'destroy']);



//Pour la productions: 
//Pour envoyer les elements de la production dans la base de donnees
Route::apiResource('productions', ProductionController::class)->only(['index', 'store']);

Route::get('/productions', [ProductionController::class, 'index']);
Route::post('/productions', [ProductionController::class, 'store']);
Route::get('/productions/{id}', [ProductionController::class, 'show']);
Route::delete('/productions/{id}', [ProductionController::class, 'destroy']);

Route::get('/employes/admin', fn () => Inertia::render('Admin/employeAdmin'))->name('produit');
Route::get('/employes/{id}', [EmployeController::class, 'show'])->name('employes.show');
Route::get('/formulaireemploye/admin', fn () => Inertia::render('formulaire/formulaireEmploye'))->name('produit');
Route::post('/admin/users', [UserController::class, 'store'])->name('users.store');

//acces utilisateur
Route::get('/recupeemploye', [UserController::class, 'recupeEmployes']);
Route::get('/users', [UserController::class, 'index']);
 Route::post('/users', [UserController::class, 'store'])->name('users.store');
Route::get('/employes-json', [UserController::class, 'recupeEmployes']);
 //Pour supprimer un employe
Route::delete('/recupeemploye/{id}', [EmployeController::class, 'destroy'])->middleware('auth');
Route::post('/admin/users/{user}/permissions', [PermissionController::class, 'updatePermissions'])->name('admin.users.permissions');

//affichage des utilisateurs connectés
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/accesutilisateur/admin', [AdminController::class, 'accesUtilisateur'])->name('acces.utilisateur');
    Route::get('/clients/admin', [AdminController::class, 'client'])->name('client.admin');
    Route::get('/rapport/admin', [AdminController::class, 'rapport'])->name('rapport.admin');
    Route::get('/historique/admin', [AdminController::class, 'historique'])->name('client.admin');
    Route::get('/employes/admin', [AdminController::class, 'employes'])->name('employe.admin');
    Route::get('/produits/admin', [AdminController::class, 'produits'])->name('produits.admin');
    Route::get('/ventes/admin', [AdminController::class, 'vente'])->name('ventes.admin');
    Route::get('/ingredients/admin', [AdminController::class, 'ingredientLab'])->name('ingredient.lab');
    Route::get('/productions/admin', [AdminController::class, 'productions'])->name('production.admin');
    Route::get('/fournisseurs/admin', [AdminController::class, 'fournisseur'])->name('fournisseur.admin');
    Route::get('/formules/admin', [AdminController::class, 'formules'])->name('formule.commande');
    Route::get('/reapprovisionnements/admin', [AdminController::class, 'reapprovisionnement'])->name('reapprovisionnement.admin');


});

Route::get('/clients/create', [ClientController::class, 'create'])->name('clients.create');
Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');

//Pour affichage des differents elements des clients
Route::get('/clients', [ClientController::class, 'index1'])->name('clients.index');
Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

//POur la page des ventes
//Pour recuperer les donnees qui sont affichees dans le diagramme de ventes hebdomadaires
Route::get('/ventes-hebdomadaires', [CommandeController::class, 'ventesHebdomadaires']);

//Pour recuperer les donnees qui sont affichees dans le tableau des ventes 
Route::get('/infoventes', [CommandeController::class, 'getVentes']);
Route::delete('/ventedestroy/{id}', [CommandeController::class, 'destroy']);

//Recuperation des elements des cadres de statistiques
Route::get('/rapport-data', [RapportController::class, 'getRapportData']);

//Recuperation des 5 produits les plus vendus
Route::get('/top-produits-vendus', [RapportController::class, 'getTopProduitsVendus']);

//Recuperation des produits par categorie
Route::get('/ventes-par-categorie-senteur', [RapportController::class, 'getVentesParCategorieSenteur']);

Route::get('/details-ventes', [RapportController::class, 'getDetailsVentes']);

require __DIR__.'/auth.php';


Route::middleware(['auth'])->group(function () {
    Route::get('/attribution/admin', function () {
        return Inertia::render('Admin/AttributionAdmin', [
            'attributions' => Attribution::all(), // si tu veux passer les données
        ]);
    })->name('attribution.admin');
});


Route::post('/attribution', [AttributionController::class, 'store'])->name('attribution.store');

Route::post('/zones', [ZoneController::class, 'store'])->name('zones.store');

Route::middleware(['auth'])->group(function () {
    // Page Inertia qui affiche le formulaire d'attribution
    Route::get('/attribution/admin', [AttributionController::class, 'index'])->name('attribution.admin');

    // Endpoint pour créer l'attribution (store multiple zone lines)
    Route::post('/attribution/store', [AttributionController::class, 'store'])->name('attribution.store');

    // Quick create zone (AJAX) => renvoie JSON avec la zone créée
    Route::post('/attribution/zone', [AttributionController::class, 'storeZone'])->name('attribution.zone');
});

Route::get('/employes/admin', fn () => Inertia::render('Admin/employeAdmin'))->name('produit');


// AJOUTEZ CETTE ROUTE POUR LES CLIENTS :
Route::get('/clients/{id}', [ClientController::class, 'show'])->name('clients.show');


Route::get('/attribution', [AttributionController::class, 'index']);
Route::post('/attribution', [AttributionController::class, 'storeAttribution']);
Route::post('/zone', [AttributionController::class, 'storeZone']);


Route::get('/attributions', [AttributionController::class, 'getAttributions']);


// Assurez-vous d'avoir cette route pour votre formulaire
Route::get('/formulaireattribution/admin', [AttributionController::class, 'formulaire'])
    ->name('formulaire.attribution');

// Route POST pour enregistrer une attribution (manquante)
Route::post('/attributions', [AttributionController::class, 'store'])
    ->name('attributions.store');
// Cherchez la section où vous avez déjà des routes pour les attributions
// (environ ligne 243-244 dans votre fichier actuel)
Route::get('/attributions', [AttributionController::class, 'getAttributions']);

// AJOUTEZ CETTE ROUTE POUR LA SUPPRESSION :
Route::delete('/attributions/{id}', [AttributionController::class, 'destroy'])
    ->name('attributions.destroy');

// Assurez-vous d'avoir cette route pour votre formulaire
Route::get('/formulaireattribution/admin', [AttributionController::class, 'formulaire'])
    ->name('formulaire.attribution');

// Route POST pour enregistrer une attribution
Route::post('/attributions', [AttributionController::class, 'store'])
    ->name('attributions.store');

Route::middleware(['auth'])->group(function () {
    // Pour la page admin d'attribution
    Route::get('/attribution/admin', [AttributionController::class, 'index'])->name('attribution.admin');
    
    // ... autres routes
});

//CAS 1
// 1. Nouveaux imports ajoutés
// Version 2 - NOUVEAUX IMPORTS :
// use App\Http\Controllers\PanierController;
// use App\Http\Controllers\FavoriteController;
// use App\Http\Controllers\AccessoireController;
// use App\Http\Controllers\ServiceController;
// use App\Http\Controllers\LocalisationController;
// use App\Http\Controllers\AffectationController;


//CAS 2                                             
// 2. Nouvelles routes ajoutées
// Routes pour accessoires :
// Route::get('/famille/accessoires', [AccessoireController::class, 'index'])->name('accessoires.index');
// Route::get('/accessoire/{slug}', [AccessoireController::class, 'show'])->name('accessoire.show');

// Routes pour favoris :
// Route::get('/mes-favoris', [FavoriteController::class, 'index'])->middleware('auth');
// Routes pour dashboard utilisateur :
// Route::get('/user-dashboard', [CommandeController::class, 'dashboard'])->name('user.dashboard');


//CAS 3
// Route::get('/quiz/step4', function () {
//     return Inertia::render('FragranceQuizStep4');
// });
// Route::get('/quiz/step4/homme', function () {
//     return Inertia::render('FragranceQuizStep4-homme');
// });
// Route::get('/quiz/step3-homme', function () {
//     return Inertia::render('FragranceQuizStep3-homme');
// });
// Route::get('/quiz/step5', function (\Illuminate\Http\Request $request) {
//     return Inertia::render('FragranceQuizStep5', [
//         'selectedSex' => $request->selectedSex,
//         'scentType' => $request->scentType,
//         'mood' => $request->mood,
//         'vibe' => $request->vibe,
//     ]);
// });
// Route::get('/quiz/step5-homme', function (\Illuminate\Http\Request $request) {
//     return Inertia::render('FragranceQuizStep5-homme', [
//         'selectedSex' => $request->selectedSex,
//         'scentType' => $request->scentType,
//         'mood' => $request->mood,
//         'vibe' => $request->vibe,
//     ]);
// });


//CAS 4
// Route résultat final du quiz :

// Route::get('/quiz/fragrance-result', fn () => Inertia::render('FragranceQuizStepfinal'));


//CAS 5
// ❌ SUPPRIMÉES dans Version 2 :
// Route::post('/import', [ProduitController::class, 'import']);
// Route::post('/ingredients/import', [IngredientController::class, 'import'])->name('ingredients.import');
// Route::post('/fournisseurs/import', [FournisseurController::class, 'import']);
// Route::post('/formules/import', [FormuleController::class, 'import']);
// Route::post('/reapprovisionnements/import', [ReapprovisionnementController::class, 'import']);
// Route::post('/clients/import', [ClientController::class, 'import']);
// Route::post('/employes/import', [EmployeController::class, 'import']);
// Route::group(['prefix' => 'rapport'], function() { ... });
// Route::get('/rapport-complet', [RapportController::class, 'getFullReport']);
// Route::get('/recupeemploye/{id}', [EmployeController::class, 'show'])->middleware('auth');
// Route::get('/clients/{id}', [ClientController::class, 'show']);
// Route::get('/admin/acces-utilisateur', [AdminController::class, 'accesUtilisateur'])->name('acces.utilisateur');


