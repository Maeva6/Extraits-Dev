<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia; // N'oubliez pas d'importer Inertia

class ClientController extends Controller
{
    public function index1()
    {
        // Récupère tous les utilisateurs avec le rôle 'client'
        $clients = User::where('role', 'client')->get();
        
        return response()->json($clients);
    }

    public function index()
    {
        return Inertia::render('Client/Index', [
            'clients' => User::where('role', 'client')
                           ->orderBy('created_at', 'desc')
                           ->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Client/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string'
        ]);
    
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role']
        ]);
    
         return response()->json(['message' => 'Client créé avec succès']);
    }

    public function destroy($id)
    {
        try {
            $client = User::findOrFail($id);
            $client->delete();
            
            // ✅ Retourner une redirection Inertia
            return redirect()->route('clients.admin')->with([
                'success' => 'Client supprimé avec succès'
            ]);
            
        } catch (\Exception $e) {
            return redirect()->route('client.admin')->with([
                'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ]);
        }
    }

      public function show($id)
    {
        try {
            $client = User::where('id', $id)
                        ->where('role', 'client')
                        ->firstOrFail();
            
            return response()->json([
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'address' => $client->address,
                'status' => $client->status ?? 'Actif',
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Client non trouvé'
            ], 404);
        }
    }
     public function import(Request $request)
    {
        $validated = $request->validate([
            'clients' => 'required|array|min:1',
            'clients.*.name' => 'required|string|max:255',
            'clients.*.email' => 'required|email|unique:users,email',
            'clients.*.phone' => 'nullable|string|max:20',
            'clients.*.address' => 'nullable|string',
            'clients.*.status' => 'required|in:Actif,Inactif'
        ]);
    
        $createdClients = [];
        
        foreach ($request->clients as $clientData) {
            $client = User::create([
                'name' => $clientData['name'],
                'email' => $clientData['email'],
                'phone' => $clientData['phone'] ?? null,
                'address' => $clientData['address'] ?? null,
                'status' => $clientData['status'],
                'password' =>  Hash::make('1234'),
                'role' => 'client'
            ]);
            
            $createdClients[] = $client;
        }
    
        // Retournez une réponse Inertia au lieu de JSON
        return back()->with([
            'success' => 'Importation réussie',
            'count' => count($createdClients),
            'createdClients' => $createdClients
        ]);
    }
}

//CAS 1
// VERSION 1 - Plus d'imports :
// use App\Models\User;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Support\Facades\DB;
// use Inertia\Inertia;

// VERSION 2 - Imports réduits :
// use App\Models\User;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Hash;
// use Inertia\Inertia;


//CAS 2
//2. Ordre des méthodes - Position de show() et import()
// VERSION 1 - Ordre : index1, index, create, store, destroy, import, show
// public function index1() { ... }
// public function index() { ... }
// public function create() { ... }
// public function store(Request $request) { ... }
// public function destroy($id) { ... }
// public function import(Request $request) { ... }
// public function show($id) { ... }

// VERSION 2 - Ordre : index1, index, create, store, destroy, show, import
// public function index1() { ... }
// public function index() { ... }
// public function create() { ... }
// public function store(Request $request) { ... }
// public function destroy($id) { ... }
// public function show($id) { ... }
// public function import(Request $request) { ... }


//CAS 3
//Méthode import() - Ligne 72 vs 74
// VERSION 1 - Position à la ligne ~72 :
//public function import(Request $request)
//{
    // ... code identique
//}

// VERSION 2 - Position à la ligne ~74 :
//public function import(Request $request)
//{
    // ... code identique
//}


//CAS 4
//4. Méthode show() - Ligne 95 vs 56

// VERSION 1 - Position à la ligne ~95 :
//public function show($id)
//{
    // ... code identique
//}

// VERSION 2 - Position à la ligne ~56 :
//public function show($id)
//{
    // ... code identique
//}