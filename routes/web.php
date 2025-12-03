<?php

use App\Http\Controllers\AccessoireController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\FormuleController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\PanierController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ReapprovisionnementController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Models\Produit;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ================================================================
// 1. PAGE D'ACCUEIL & ROUTES PUBLIQUES
// ================================================================

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
})->name('home');

// ================================================================
// 2. PAGES PRODUITS & CATÉGORIES (avec données dans les props !)
// ================================================================

// Parfums d'ambiance
Route::get('/famille/parfums-dambiance', [ProductController::class, 'homeFragrance'])
    ->name('senteurs.ambiance');

// Parfums de corps
Route::get('/famille/parfums-de-corps', [ProduitController::class, 'parfumsDeCorps']);
Route::get('/body-perfume', [ProductController::class, 'bodyPerfume'])->name('body.perfume');

// Cosmétiques
Route::get('/famille/cosmetiques', fn () => Inertia::render('Cosmetiques'))->name('senteurs');
Route::get('/famille/cosmetiques', [ProductController::class, 'cosmetiques'])->name('cosmetiques');

// Accessoires
Route::get('/famille/accessoires', [AccessoireController::class, 'index'])
    ->name('accessoires.index');
Route::get('/accessoire/{slug}', [AccessoireController::class, 'show'])
    ->name('accessoire.show');

// Page produit unique
Route::get('/product/{id}', [ProductController::class, 'show'])
    ->name('product.show');

// ================================================================
// 3. QUIZ & RECOMMANDATIONS
// ================================================================

Route::get('/find-my-fragrance', fn () => Inertia::render('FragranceQuizStep1'))->name('quiz.start');
Route::get('/quiz/ingredients-data', [IngredientController::class, 'list'])->name('quiz.ingredients.data');
Route::get('/quiz/resultat', [RecommendationController::class, 'result'])->name('quiz.result');
Route::get('/quiz/step4/homme', function () {
    return Inertia::render('FragranceQuizStep4-homme');
});
Route::get('/quiz/step3-homme', function () {
    return Inertia::render('FragranceQuizStep3-homme');
});
Route::get('/quiz/fragrance-result', fn () => Inertia::render('FragranceQuizStepfinal'));

// Autres étapes du quiz (simplifiées)
Route::get('/quiz/senteurs', fn () => Inertia::render('FragranceQuizStep3'))->name('quiz.senteurs');
Route::get('/quiz/senteurs-homme', fn () => Inertia::render('FragranceQuizStep2Homme'));
Route::get('/quiz/step4', fn () => Inertia::render('FragranceQuizStep4'));
Route::get('/quiz/step5-homme', function (\Illuminate\Http\Request $request) {
    return Inertia::render('FragranceQuizStep5-homme', [
        'selectedSex' => $request->selectedSex,
        'scentType' => $request->scentType,
        'mood' => $request->mood,
        'vibe' => $request->vibe,
    ]);
});
Route::get('/quiz/ingredients', fn () => Inertia::render('FragranceQuizStep2'));
Route::get('/quiz/step5', function (\Illuminate\Http\Request $request) {
    return Inertia::render('FragranceQuizStep5', [
        'selectedSex' => $request->selectedSex,
        'scentType' => $request->scentType,
        'mood' => $request->mood,
        'vibe' => $request->vibe,
    ]);
});

// ================================================================
// 4. PAGES STATIQUES
// ================================================================

Route::get('/notre-histoire', fn () => Inertia::render('About'))->name('about');
Route::get('/contact', fn () => Inertia::render('Contact'))->name('contact');
Route::get('/services/gift-set', fn () => Inertia::render('SpecialGiftSet'))->name('giftset');
Route::get('/services/gift-set', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);

// ================================================================
// 5. UTILISATEUR AUTHENTIFIÉ (client)
// ================================================================

Route::middleware('auth')->group(function () {

    // Dashboard client
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Favoris
    Route::inertia('/mes-favoris', 'FavoritesPage')->name('favorites');
    Route::get('/mes-favoris', [FavoriteController::class, 'index']);

    // Commandes
    Route::get('/user-dashboard', [CommandeController::class, 'dashboard'])->name('user.dashboard');
    Route::get('/mes-commandes', [CommandeController::class, 'index'])->name('orders.index');
    Route::get('/checkout', fn () => Inertia::render('Checkout'))->name('checkout');
    Route::post('/orders', [CommandeController::class, 'store'])->name('orders.store');
});

// ================================================================
// 6. ADMIN (superadmin, administrateur, employe)
// ================================================================

Route::middleware(['auth'])->group(function () {

    Route::get('/dashboard-admin', function () {
        $user = Auth::user();
        if (!in_array($user->role, ['superadmin', 'administrateur', 'employe'])) {
            abort(403);
        }
        return Inertia::render('Admin/Dashboard', ['user' => $user]);
    })->name('admin.dashboard');

    // Redirection dashboard selon rôle
    Route::get('/dashboard', function () {
        if (in_array(Auth::user()->role, ['superadmin', 'administrateur', 'employe'])) {
            return redirect()->route('admin.dashboard');
        }
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Pages admin (simplifiées)
    Route::get('/produits/admin', fn () => Inertia::render('Admin/produitAdmin'))->name('produits.admin');
    Route::get('/clients/admin', [AdminController::class, 'client'])->name('clients.admin');
    Route::get('/commandes/admin', [AdminController::class, 'index1']);
    Route::get('/ingredients/admin', fn () => Inertia::render('Admin/ingredientLab'));
    Route::get('/ventes/admin', [AdminController::class, 'vente'])->name('ventes.admin');
    // ... ajoute les autres si besoin
});

// ================================================================
// 7. API PUBLIQUES (JSON) – préfixe automatique /api si tu les mets dans routes/api.php
// ================================================================

Route::prefix('')->group(function () {
    Route::get('/produits', [ProduitController::class, 'index']);
    Route::get('/produits/{id}', [ProduitController::class, 'show']);
    Route::get('/produits/search', [ProduitController::class, 'search']);

    Route::get('/categories', [CategorieController::class, 'index']);

    Route::get('/ingredients', [IngredientController::class, 'index']);
    Route::get('/ingredients/{id}', [IngredientController::class, 'show']);

    Route::get('/fournisseurs', [FournisseurController::class, 'index']);
    Route::get('/formules', [FormuleController::class, 'index']);
    Route::get('/reapprovisionnements', [ReapprovisionnementController::class, 'index']);
    Route::apiResource('productions', ProductionController::class)->only(['index', 'show']);
});

// ================================================================
// 8. AUTRES API & DONNÉES DYNAMIQUES
// ================================================================

Route::get('/ventes-hebdomadaires', [CommandeController::class, 'ventesHebdomadaires']);
Route::get('/infoventes', [CommandeController::class, 'getVentes']);
Route::get('/rapport-data', [RapportController::class, 'getRapportData']);
Route::get('/top-produits-vendus', [RapportController::class, 'getTopProduitsVendus']);
Route::get('/ventes-par-categorie-senteur', [RapportController::class, 'getVentesParCategorieSenteur']);

// ================================================================
// 9. FOOTER
// ================================================================
Route::get('/politique-de-confidentialite', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy.policy');
Route::get('/cookies', function () {
    return Inertia::render('Cookies');
})->name('cookies.policy');
Route::get('/conditions-utilisation', function () {
    return Inertia::render('TermsOfUse');
})->name('terms.use');
Route::get('/faq', function () {
    return Inertia::render('FaqPage');
})->name('faq.page');


// ================================================================
// 10. PANIER
// ================================================================
Route::middleware('auth')->group(function () {
    Route::get('/panier', [PanierController::class, 'index']);
    Route::post('/panier/ajouter', [PanierController::class, 'ajouter']);
    Route::delete('/panier/{produit_id}', [PanierController::class, 'supprimer']);
    Route::delete('/panier', [PanierController::class, 'vider']);
    });

// ================================================================
// 11. BACK-OFFICE
// ================================================================

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

Route::middleware(['auth'])->group(function () {
    Route::get('/commandes/admin', [AdminController::class, 'index1']);
    Route::post('/admin/commandes', [CommandeController::class, 'store']);

    
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

//API pour reapprovisionnements
Route::get('/reapprovisionnements', [ReapprovisionnementController::class, 'index']);
Route::get('/reapprovisionnements/{id}', [ReapprovisionnementController::class, 'show']);


//Pour la productions: 
//Pour envoyer les elements de la production dans la base de donnees
Route::apiResource('productions', ProductionController::class)->only(['index', 'store']);

Route::get('/productions', [ProductionController::class, 'index']);
Route::post('/productions', [ProductionController::class, 'store']);
Route::get('/productions/{id}', [ProductionController::class, 'show']);
Route::delete('/productions/{id}', [ProductionController::class, 'destroy']);

Route::get('/employes/admin', fn () => Inertia::render('Admin/employeAdmin'))->name('produit');
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

// ================================================================
// 12. FAVORIS
// ================================================================
 Route::inertia('/mes-favoris', 'FavoritesPage')->name('favorites');
    Route::get('/mes-favoris', [FavoriteController::class, 'index'])->middleware('auth');
    Route::post('/favorites', [FavoriteController::class, 'store'])->middleware('auth');
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');

// ================================================================
// 13. Vérification des emails
// ================================================================


require __DIR__.'/auth.php';