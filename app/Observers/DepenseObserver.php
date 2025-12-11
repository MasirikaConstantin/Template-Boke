<?php

namespace App\Observers;

use App\Models\Depense;
use App\Models\Budget;

class DepenseObserver
{
    /**
     * Quand une dépense est créée
     */
    public function created(Depense $depense): void
    {
        // Seulement si payé
        if ($depense->statut === 'paye') {
            $budget = Budget::find($depense->budget_id);

            if ($budget) {
                $budget->increment('montant_depense', $depense->montant);
            }
        }
    }

    /**
     * Quand une dépense est mise à jour
     */
    public function updated(Depense $depense): void
    {
        // Ancienne valeur du statut
        $oldStatut = $depense->getOriginal('statut');
        $oldMontant = $depense->getOriginal('montant');
        $oldBudgetId = $depense->getOriginal('budget_id');

        $newStatut = $depense->statut;
        $newMontant = $depense->montant;
        $newBudgetId = $depense->budget_id;

        // CAS 1 : Le budget change → on restaure l'ancien et applique au nouveau
        if ($oldBudgetId !== $newBudgetId) {

            // RETIRER du budget précédent si payé
            if ($oldStatut === 'paye') {
                Budget::where('id', $oldBudgetId)
                    ->decrement('montant_depense', $oldMontant);
            }

            // AJOUTER au nouveau budget si payé
            if ($newStatut === 'paye') {
                Budget::where('id', $newBudgetId)
                    ->increment('montant_depense', $newMontant);
            }

            return;
        }

        // CAS 2 : Le statut change
        if ($oldStatut !== $newStatut) {

            $budget = Budget::find($newBudgetId);

            if (!$budget) return;

            // Si passe de non-payé → payé
            if ($oldStatut !== 'paye' && $newStatut === 'paye') {
                $budget->increment('montant_depense', $newMontant);
            }

            // Si passe de payé → non payé
            if ($oldStatut === 'paye' && $newStatut !== 'paye') {
                $budget->decrement('montant_depense', $oldMontant);
            }

            return;
        }

        // CAS 3 : Montant modifié alors que la dépense est "paye"
        if ($oldMontant !== $newMontant && $newStatut === 'paye') {

            $difference = $newMontant - $oldMontant;

            Budget::where('id', $newBudgetId)
                ->increment('montant_depense', $difference);
        }
    }

    /**
     * Quand une dépense est supprimée
     */
    public function deleted(Depense $depense): void
    {
        // Si la dépense supprimée était "paye", on restaure le budget
        if ($depense->statut === 'paye') {
            Budget::where('id', $depense->budget_id)
                ->decrement('montant_depense', $depense->montant);
        }
    }
}
