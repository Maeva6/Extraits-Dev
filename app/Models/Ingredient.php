<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomIngredient', 'description', 'fournisseur', 
        'stockActuel', 'prix', 'seuilAlerte', 
        'categorie', 'photo', 'etat_physique'
    ];

    // Ajoutez cette propriété pour inclure l'accesseur dans la sérialisation JSON
    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute()
    {
        return $this->photo;
    }
    public function formules()
    {
        return $this->belongsToMany(Formule::class, 'formule_ingredient')
                    ->withPivot('quantite', 'unite');
    } 
        public function produits()
    {
        return $this->belongsToMany(Produit::class, 'produit_ingredient', 'ingredient_id', 'produit_id');
    }
    public function produitsPrincipaux()
    {
        return $this->hasMany(Produit::class, 'ingredient_principal_id');
    }

 // Ajoutez cette relation si vous avez un fournisseur_id dans la table ingredients
    public function fournisseurDetail()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id');
    }

}


//CAS 1
//1. Relations modifiées et ajoutées
// Version 1 :
// public function reapprovisionnements()
// {
//     return $this->hasMany(Reapprovisionnement::class);
// }
// Version 2 : ❌ SUPPRIMÉE


//CAS 2
// 2. Accesseurs/mutateurs supprimés
// Version 1 : ✅ PRÉSENTS
// public function getQuantiteAttribute()
// {
//     return $this->stockActuel;
// }
// public function setQuantiteAttribute($value)
// {
//     $this->attributes['stockActuel'] = $value;
// }
// Version 2 : ❌ SUPPRIMÉS


//CAS 3
// 3. Nouvelle relation ajoutée
// Version 2 : ✅ NOUVELLE RELATION
// public function produitsPrincipaux()
// {
//     return $this->hasMany(Produit::class, 'ingredient_principal_id');