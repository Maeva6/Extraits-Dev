<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProduitAttribution extends Model
{
    use HasFactory;

    protected $table = 'produit_attributions';
    protected $fillable = ['produit_id', 'zone_id', 'date_attribution', 'quantite'];

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }

    public function zone()
    {
        return $this->belongsTo(ZoneAttribution::class, 'zone_id');
    }
}
