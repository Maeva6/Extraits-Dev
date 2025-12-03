<?php


// database/seeders/IngredientsSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produit;
use App\Models\Ingredient;
use Illuminate\Support\Arr;

class IngredientsSeeder extends Seeder
{
    public function run()
    {
        // Récupère et mélange une fois le pool d’ingrédients
        $ingredients = Ingredient::select('id', 'categorie')->get()->all();
        $ingredientIds = array_map(fn($i) => $i->id, $ingredients);

        if (count($ingredientIds) < 3) {
            $this->command->warn('Moins de 3 ingrédients disponibles — impossible d’attribuer des triplets.');
            return;
        }

        // Mélange global pour casser la monotonie
        shuffle($ingredientIds);

        // Set mémoire pour éviter les mêmes triplets (par IDs triés)
        $usedTriplets = [];

        // Parcours par chunks pour éviter le surcoût mémoire
        Produit::with('ingredients')->chunk(200, function ($produits) use (&$ingredientIds, &$usedTriplets, $ingredients) {
            $poolSize = count($ingredientIds);

            foreach ($produits as $produit) {
                $current = $produit->ingredients->pluck('id')->all();
                $need = 3 - count($current);

                if ($need <= 0) {
                    continue; // déjà 3 ou plus
                }

                // Fonction utilitaire: récupérer un triplet en évitant collisions et doublons
                $triplet = $this->pickTripletDistinct($ingredientIds, $current, $usedTriplets, $poolSize, $produit->id);

                // Si le produit a déjà 1–2 ingrédients, on ne rattache que le nombre manquant
                $toAttach = array_values(array_diff($triplet, $current));
                if (count($toAttach) > $need) {
                    $toAttach = array_slice($toAttach, 0, $need);
                }

                if (!empty($toAttach)) {
                    $produit->ingredients()->attach($toAttach);
                }
            }
        });
    }

    /**
     * Retourne un triplet (3 IDs d’ingrédients) distincts des existants du produit,
     * avec anti-collision inter-produits et décalage sur offset déterministe.
     */
    private function pickTripletDistinct(array $ingredientIds, array $existingIds, array &$usedTriplets, int $poolSize, int $prodId): array
    {
        // Offset déterministe (répartit de manière stable)
        $offset = crc32((string)$prodId) % $poolSize;

        // Essais limités pour éviter boucles infinies
        for ($attempt = 0; $attempt < min(50, $poolSize); $attempt++) {
            // Prendre 3 indices en “wrap-around”
            $idxs = [
                ($offset + $attempt) % $poolSize,
                ($offset + $attempt + 1) % $poolSize,
                ($offset + $attempt + 2) % $poolSize,
            ];
            $candidate = [
                $ingredientIds[$idxs[0]],
                $ingredientIds[$idxs[1]],
                $ingredientIds[$idxs[2]],
            ];

            // Éviter doublons du produit
            if (count(array_unique(array_merge($existingIds, $candidate))) < count($existingIds) + count($candidate)) {
                continue;
            }

            // Triplet trié pour comparer indépendamment de l’ordre
            $key = implode('-', Arr::sort($candidate));
            if (!isset($usedTriplets[$key])) {
                $usedTriplets[$key] = true;
                return $candidate;
            }
        }

        // Fallback: prendre 3 IDs non présents chez le produit, en “best effort”
        $candidate = [];
        foreach ($ingredientIds as $iid) {
            if (!in_array($iid, $existingIds, true)) {
                $candidate[] = $iid;
            }
            if (count($candidate) === 3) break;
        }
        // Si la diversité est trop faible, compléter quand même
        if (count($candidate) < 3) {
            // Prendre au hasard sans contrainte (dernière chance)
            $candidate = Arr::take(Arr::shuffle($ingredientIds), 3);
        }

        $key = implode('-', Arr::sort($candidate));
        $usedTriplets[$key] = true;
        return $candidate;
    }
}
