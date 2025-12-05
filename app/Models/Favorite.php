<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $table = 'favorites';

    protected $fillable = ['user_id', 'produit_id', 'service_id', 'accessoire_id'];

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function accessoire()
    {
        return $this->belongsTo(Accessoires::class, 'accessoire_id');
    }
}



//CAS 1
// 1. Table explicitement définie
// Version 2 :
// protected $table = 'favorites';

//CAS 2
// Version 1 :
// protected $fillable = [
//     'user_id',
//     'produit_id',
// ];
// Version 2 :
// protected $fillable = ['user_id', 'produit_id', 'service_id', 'accessoire_id'];

//CAS 3
// 3. Relations modifiées et ajoutées
// Version 1 :
// public function user()
// {
//     return $this->belongsTo(User::class);
// }

// public function produit()
// {
//     return $this->belongsTo(Produit::class);
// }

// Version 2 :
// public function produit()
// {
//     return $this->belongsTo(Produit::class, 'produit_id');
// }

// ✅ NOUVELLES RELATIONS dans Version 2 :
// public function service()
// {
//     return $this->belongsTo(Service::class, 'service_id');
// }

// public function accessoire()
// {
//     return $this->belongsTo(Accessoires::class, 'accessoire_id');
// }


//CAS 4
// 4. Relation user supprimée
// Version 1 : ✅ Relation user présente
// public function user()
// {
//     return $this->belongsTo(User::class);
// }

// Version 2 : ❌ Relation user absente