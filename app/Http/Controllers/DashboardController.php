<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Eleve;
use App\Models\Depense;
use App\Models\Budget;
use App\Models\Classe;
use Illuminate\Support\Facades\DB;
class DashboardController extends Controller
{
    /**
     * Récupère toutes les statistiques du tableau de bord
     */
    public function index(Request $request)
    {
        try {
            // Statistiques principales
            $stats = $this->getMainStats();
            
            // Activités récentes
            $recentActivities = $this->getRecentActivities();
            
            // Vue d'ensemble
            $systemOverview = $this->getSystemOverview();
            
            // Données pour graphiques (optionnel)
            $chartData = $this->getChartData();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_activities' => $recentActivities,
                    'system_overview' => $systemOverview,
                    'chart_data' => $chartData,
                ],
                'message' => 'Données du tableau de bord récupérées avec succès',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Statistiques principales
     */
    private function getMainStats()
    {
        $now = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();
        
        // Élèves inscrits
        $totalEleves = Eleve::where('statut', 'actif')->count();
        $totalElevesLastMonth = Eleve::where('statut', 'actif')
            ->where('created_at', '<=', $lastMonth)
            ->count();
        $elevesChange = $totalElevesLastMonth > 0 
            ? round((($totalEleves - $totalElevesLastMonth) / $totalElevesLastMonth) * 100, 1)
            : 0;

        // Classes actives
        $totalClasses = Classe::where('statut', "active")->count();
        // Pour la démo, on prend +2
        $classesChange = 2;

        // Recettes du mois en cours
        $currentMonth = $now->format('Y-m');
        $recettes = Paiement::whereRaw("DATE_FORMAT(date_paiement, '%Y-%m') = ?", [$currentMonth])
            ->sum('montant');
            
        $lastMonthRecettes = Paiement::whereRaw("DATE_FORMAT(date_paiement, '%Y-%m') = ?", [$lastMonth->format('Y-m')])
            ->sum('montant');
        $recettesChange = $lastMonthRecettes > 0 
            ? round((($recettes - $lastMonthRecettes) / $lastMonthRecettes) * 100, 1)
            : 0;

        // Dépenses du mois en cours
        $depenses = Depense::where('statut', 'paye')
            ->whereRaw("DATE_FORMAT(date_depense, '%Y-%m') = ?", [$currentMonth])
            ->sum('montant');
            
        $lastMonthDepenses = Depense::where('statut', 'paye')
            ->whereRaw("DATE_FORMAT(date_depense, '%Y-%m') = ?", [$lastMonth->format('Y-m')])
            ->sum('montant');
        $depensesChange = $lastMonthDepenses > 0 
            ? round((($depenses - $lastMonthDepenses) / $lastMonthDepenses) * 100, 1)
            : 0;

        return [
            [
                'title' => 'Élèves inscrits',
                'value' => number_format($totalEleves, 0, '', ' '),
                'change' => ($elevesChange >= 0 ? '+' : '') . $elevesChange . '%',
                'trend' => $elevesChange >= 0 ? 'up' : 'down',
                'icon' => 'Users',
                'color' => 'text-blue-600',
                'bg_color' => 'bg-blue-100',
            ],
            [
                'title' => 'Classes actives',
                'value' => $totalClasses,
                'change' => '+2',
                'trend' => 'up',
                'icon' => 'School',
                'color' => 'text-green-600',
                'bg_color' => 'bg-green-100',
            ],
            [
                'title' => 'Recettes mensuelles',
                'value' => $this->formatCurrency($recettes),
                'change' => ($recettesChange >= 0 ? '+' : '') . $recettesChange . '%',
                'trend' => $recettesChange >= 0 ? 'up' : 'down',
                'icon' => 'TrendingUp',
                'color' => 'text-purple-600',
                'bg_color' => 'bg-purple-100',
            ],
            [
                'title' => 'Dépenses mensuelles',
                'value' => $this->formatCurrency($depenses),
                'change' => ($depensesChange >= 0 ? '+' : '') . $depensesChange . '%',
                'trend' => $depensesChange <= 0 ? 'down' : 'up',
                'icon' => 'TrendingDown',
                'color' => 'text-amber-600',
                'bg_color' => 'bg-amber-100',
            ],
        ];
    }

    /**
     * Activités récentes
     */
    private function getRecentActivities()
    {
        $activities = [];
        
        // Derniers paiements
        $paiements = Paiement::with(['eleve', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        foreach ($paiements as $paiement) {
            $activities[] = [
                'id' => 'p_' . $paiement->id,
                'type' => 'paiement',
                'description' => $paiement->eleve ? 
                    $paiement->eleve->nom_complet . ' a payé ' . $this->formatCurrency($paiement->montant) :
                    'Paiement de ' . $this->formatCurrency($paiement->montant),
                'time' => ($paiement->created_at->diffForHumans()),
                'details' => [
                    'reference' => $paiement->reference,
                    'mode_paiement' => $paiement->mode_paiement,
                ]
            ];
        }

        // Dernières dépenses
        $depenses = Depense::with(['user', 'categorie'])
            ->where('statut', 'paye')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        foreach ($depenses as $depense) {
            $activities[] = [
                'id' => 'd_' . $depense->id,
                'type' => 'depense',
                'description' => $depense->libelle . ' - ' . $this->formatCurrency($depense->montant),
                'time' => $this->getTimeAgo($depense->created_at),
                'details' => [
                    'beneficiaire' => $depense->beneficiaire,
                    'categorie' => $depense->categorie?->nom_categorie,
                ]
            ];
        }

        // Dernières inscriptions
        $eleves = Eleve::with(['classe'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        foreach ($eleves as $eleve) {
            $activities[] = [
                'id' => 'e_' . $eleve->id,
                'type' => 'inscription',
                'description' => $eleve->nom_complet . ' inscrit en ' . ($eleve->classe?->nom_classe ?? 'N/A'),
                'time' => $this->getTimeAgo($eleve->created_at),
                'details' => [
                    'matricule' => $eleve->matricule,
                    'classe' => $eleve->classe?->nom_classe,
                ]
            ];
        }

        // Trier par date et prendre les 4 plus récents
        usort($activities, function($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return array_slice($activities, 0, 4);
    }

    /**
     * Vue d'ensemble du système
     */
    private function getSystemOverview()
    {
        $currentMonth = Carbon::now()->format('Y-m');
        
        // Élèves actifs
        $elevesActifs = Eleve::where('statut', 'actif')->count();
        
        // Paiements ce mois
        $paiementsMois = Paiement::whereRaw("DATE_FORMAT(date_paiement, '%Y-%m') = ?", [$currentMonth])
            ->count();
            
        // Dépenses ce mois
        $depensesMois = Depense::where('statut', 'paye')
            ->whereRaw("DATE_FORMAT(date_depense, '%Y-%m') = ?", [$currentMonth])
            ->count();
            
        // Budget restant
        $budgetActif = Budget::where('est_actif', true)->first();
        $budgetRestant = $budgetActif ? 
            ($budgetActif->montant_alloue - $budgetActif->montant_depense) : 0;

        return [
            'eleves_actifs' => $elevesActifs,
            'paiements_mois' => $paiementsMois,
            'depenses_mois' => $depensesMois,
            'budget_restant' => $this->formatCurrency($budgetRestant),
            'budget_restant_raw' => $budgetRestant,
            'taux_utilisation_budget' => $budgetActif ? 
                round(($budgetActif->montant_depense / $budgetActif->montant_alloue) * 100, 1) : 0,
        ];
    }

    /**
     * Données pour graphiques
     */
    private function getChartData()
    {
        $months = [];
        $recettes = [];
        $depenses = [];
        
        // 6 derniers mois
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthLabel = $date->format('M Y');
            
            $months[] = $monthLabel;
            
            // Recettes du mois
            $recettesMois = Paiement::whereRaw("DATE_FORMAT(date_paiement, '%Y-%m') = ?", [$monthKey])
                ->sum('montant');
            $recettes[] = $recettesMois;
            
            // Dépenses du mois
            $depensesMois = Depense::where('statut', 'paye')
                ->whereRaw("DATE_FORMAT(date_depense, '%Y-%m') = ?", [$monthKey])
                ->sum('montant');
            $depenses[] = $depensesMois;
        }

        return [
            'months' => $months,
            'recettes' => $recettes,
            'depenses' => $depenses,
            'labels' => [
                'recettes' => 'Recettes',
                'depenses' => 'Dépenses',
            ],
        ];
    }

    /**
     * Formate une valeur en devise
     */
    private function formatCurrency($amount)
    {
        if ($amount >= 1000000) {
            return number_format($amount / 1000000, 1, '.', ' ') . 'M $';
        } elseif ($amount >= 1000) {
            return number_format($amount / 1000, 1, '.', ' ') . 'k $';
        } else {
            return number_format($amount, 0, '.', ' ') . ' $';
        }
    }

    /**
     * Calcule le temps écoulé depuis une date
     */
    private function getTimeAgo($date)
    {
        $now = Carbon::now();
        $diff = $now->diffInMinutes($date);
        
        if ($diff < 1) {
            return 'À l\'instant';
        } elseif ($diff < 60) {
            return 'Il y a ' . $diff . ' min';
        } elseif ($diff < 1440) {
            $hours = floor($diff / 60);
            return 'Il y a ' . $hours . ' heure' . ($hours > 1 ? 's' : '');
        } else {
            $days = floor($diff / 1440);
            return 'Il y a ' . $days . ' jour' . ($days > 1 ? 's' : '');
        }
    }
}