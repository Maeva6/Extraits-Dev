<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribution extends Model
{
    protected $fillable = [
        'produit_id',
        'zone_id',
        'quantite',
        'date_attribution'
    ];

    public function produit()
    {
        return $this->belongsTo(\App\Models\Produit::class, 'produit_id');
    }

    public function zone()
    {
        return $this->belongsTo(ZoneAttribution::class, 'zone_id');
    }
}
