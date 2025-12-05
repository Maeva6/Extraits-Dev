<?php

namespace App\Http\Controllers;

use App\Models\ZoneAttribution;
use Illuminate\Http\Request;

class ZoneAttributionController extends Controller
{
    public function store(Request $request)
    {
        $zone = ZoneAttribution::create(['name' => $request->name]);

        return inertia('AttributionAdmin', ['zone' => $zone]);
    }
}
