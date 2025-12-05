<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ZoneAttribution extends Model
{
    use HasFactory;

    protected $table = 'zones_attribution';
    protected $fillable = ['nom'];

    public function attributions()
    {
        return $this->hasMany(ProduitAttribution::class, 'zone_id');
    }
}


