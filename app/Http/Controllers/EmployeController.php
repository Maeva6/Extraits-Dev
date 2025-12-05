<?php
namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class EmployeController extends Controller
{
    /**
     * Affiche la liste des employés
     */
// app/Http/Controllers/EmployeController.php
public function index()
{
    return response()->json(
        User::where('role', 'employe')
            ->orderBy('created_at', 'desc')
            ->get()
    );
}

// Dans app/Http/Controllers/EmployeController.php
public function destroy($id)
{
    try {
        $employe = User::findOrFail($id);
        $employe->delete();
        
        // ✅ Redirection AVEC message de succès
        return redirect()->route('employe.admin')->with([
            'success' => 'Employé supprimé avec succès'
        ]);
        
    } catch (\Exception $e) {
        return redirect()->route('employes.admin')->with([
            'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
        ]);
    }
}

public function import(Request $request)
{
    $validated = $request->validate([
        'employes' => 'required|array|min:1',
        'employes.*.name' => 'required|string|max:255',
        'employes.*.email' => 'required|email|unique:users,email',
        'employes.*.role' => 'required|in:employe,admin',
        'employes.*.phone' => 'nullable|string|max:20',
        'employes.*.address' => 'nullable|string'
    ]);

    $createdEmployes = [];
    
    foreach ($request->employes as $employeData) {
        $employe = User::create([
            'name' => $employeData['name'],
            'email' => $employeData['email'],
            'role' => $employeData['role'],
            'phone' => $employeData['phone'] ?? null,
            'address' => $employeData['address'] ?? null,
            'password' => bcrypt('1234') // Mot de passe par défaut
        ]);
        
        $createdEmployes[] = $employe;
    }

    return response()->json([
        'success' => true,
        'count' => count($createdEmployes),
        'message' => 'Importation réussie'
    ]);
}
public function show($id)
{
    try {
        $employe = User::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $employe->id,
                'name' => $employe->name,
                'email' => $employe->email,
                'role' => $employe->role,
                'phone' => $employe->phone,
                'address' => $employe->address,
                'created_at' => $employe->created_at,
                'updated_at' => $employe->updated_at
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Employé non trouvé'
        ], 404);
    }
}
}


//CAS 1
//1. Ordre des méthodes - Organisation du code
// VERSION 1 - Ordre : index, import, destroy, show
// public function index() { ... }
// public function import(Request $request) { ... }
// public function destroy($id) { ... }
// public function show($id) { ... }

// VERSION 2 - Ordre : index, destroy, import, show
// public function index() { ... }
// public function destroy($id) { ... }
// public function import(Request $request) { ... }
// public function show($id) { ... }


//CAS 2
// 2. Position de la méthode destroy()
// VERSION 1 - destroy() vient APRÈS import() (ligne ~40)
// public function import(Request $request) { ... }
// public function destroy($id) { ... }

// VERSION 2 - destroy() vient AVANT import() (ligne ~28)
// public function destroy($id) { ... }
// public function import(Request $request) { ... }


//CAS 3
//3. Position de la méthode import()
// VERSION 1 - import() en position 2 (ligne ~20)
// public function index() { ... }
// public function import(Request $request) { ... }

// VERSION 2 - import() en position 3 (ligne ~42)
// public function index() { ... }
// public function destroy($id) { ... }
// public function import(Request $request) { ... }