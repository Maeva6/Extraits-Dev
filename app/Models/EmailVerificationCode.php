<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailVerificationCode extends Model
{
    use HasFactory;

    protected $fillable = ['email', 'code', 'expires_at', 'is_used'];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function scopeValid($query, $email, $code)
    {
        return $query->where('email', $email)
                     ->where('code', $code)
                     ->where('is_used', false)
                     ->where('expires_at', '>', now());
    }
}