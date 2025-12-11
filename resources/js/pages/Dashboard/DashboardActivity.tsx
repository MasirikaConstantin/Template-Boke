import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  School, 
  CreditCard, 
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface StatItem {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
  bg_color: string;
}

interface ActivityItem {
  id: string;
  type: 'paiement' | 'depense' | 'inscription' | 'budget';
  description: string;
  time: string;
  details?: Record<string, string>;
}

interface SystemOverview {
  eleves_actifs: number;
  paiements_mois: number;
  depenses_mois: number;
  budget_restant: string;
  taux_utilisation_budget: number;
}

interface DashboardData {
  stats: StatItem[];
  recent_activities: ActivityItem[];
  system_overview: SystemOverview;
  chart_data?: any;
}

export default function DashboardActivity() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [],
    recent_activities: [],
    system_overview: {
      eleves_actifs: 0,
      paiements_mois: 0,
      depenses_mois: 0,
      budget_restant: '0 $',
      taux_utilisation_budget: 0,
    },
  });

  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Utilisez Inertia pour les données initiales ou faites un appel API
      // Option 1: Via Inertia (recommandé pour les données initiales)
      // Les données seraient passées en props depuis le contrôleur Laravel
      
      // Option 2: Via API fetch (pour les rafraîchissements)
      const response = await fetch('/api/v1/dashboard/stats', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Si vous utilisez un token API
          // 'Authorization': `Bearer ${process.env.API_TOKEN}`
        },
      });

      if (!response.ok) {
        console.log('Response not ok:', response);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date().toLocaleTimeString('fr-FR'));
      } else {
        throw new Error(result.message || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchDashboardData();
    
    // Rafraîchir automatiquement toutes les 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Gérer les icônes
  const iconComponents: Record<string, React.ComponentType<any>> = {
    Users,
    School,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet,
    Calendar,
  };

  // Squelette de chargement
  if (loading && dashboardData.stats.length === 0) {
    return (
      <>
        <Head title="Tableau de bord" />
        <>
          <div className="space-y-6">
            {/* Squelette pour les statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-8 w-[80px]" />
                        <Skeleton className="h-4 w-[120px]" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Squelette pour les actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-3 w-[80px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      </>
    );
  }

  return (
    <>
      <Head title="Tableau de bord" />
      
      <>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. 
              <Button 
                variant="link" 
                onClick={fetchDashboardData} 
                className="ml-2 p-0 h-auto"
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* En-tête avec bouton de rafraîchissement */}
          <div className="flex justify-between items-center">
            <div>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour: {lastUpdated}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Chargement...' : 'Rafraîchir'}
            </Button>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.stats.map((stat, index) => {
              const IconComponent = iconComponents[stat.icon] || TrendingUp;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-muted-foreground">depuis le mois dernier</span>
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-full ${stat.bg_color} flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions rapides (toujours visibles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/paiements/create">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nouveau paiement</p>
                      <p className="text-sm text-muted-foreground">Enregistrer un paiement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/depenses/create">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nouvelle dépense</p>
                      <p className="text-sm text-muted-foreground">Enregistrer une dépense</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recouvrement">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Recouvrement</p>
                      <p className="text-sm text-muted-foreground">Suivi des paiements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/budgets">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Budgets</p>
                      <p className="text-sm text-muted-foreground">Gestion des budgets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Dernières activités */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Activités récentes</CardTitle>
                <CardDescription>
                  Les dernières actions sur le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[80px]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recent_activities.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        Aucune activité récente
                      </p>
                    ) : (
                      dashboardData.recent_activities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full ${
                              activity.type === 'paiement' ? 'bg-green-100 text-green-600' :
                              activity.type === 'depense' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'inscription' ? 'bg-purple-100 text-purple-600' :
                              'bg-amber-100 text-amber-600'
                            } flex items-center justify-center`}>
                              {activity.type === 'paiement' && <CreditCard className="h-4 w-4" />}
                              {activity.type === 'depense' && <TrendingDown className="h-4 w-4" />}
                              {activity.type === 'inscription' && <Users className="h-4 w-4" />}
                              {activity.type === 'budget' && <Wallet className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{activity.description}</p>
                              <p className="text-sm text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statut du système</CardTitle>
                <CardDescription>
                  Vue d'ensemble
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[50px]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Élèves actifs</span>
                      <span className="font-medium">{dashboardData.system_overview.eleves_actifs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Paiements ce mois</span>
                      <span className="font-medium">{dashboardData.system_overview.paiements_mois}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dépenses ce mois</span>
                      <span className="font-medium">{dashboardData.system_overview.depenses_mois}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budget restant</span>
                      <span className="font-medium text-green-600">
                        {dashboardData.system_overview.budget_restant}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Utilisation du budget</span>
                          <span>{dashboardData.system_overview.taux_utilisation_budget}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dashboardData.system_overview.taux_utilisation_budget > 80 ? 'bg-red-500' :
                              dashboardData.system_overview.taux_utilisation_budget > 50 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(dashboardData.system_overview.taux_utilisation_budget, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link href="/paiements/rapport" className="block">
                        <Button variant="outline" className="w-full">
                          Voir le rapport complet
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    </>
  );
}