import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';

export default function DashboardActivity() {
  const stats = [
    {
      title: 'Élèves inscrits',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Classes actives',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: School,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Recettes mensuelles',
      value: '12.5M $',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Dépenses mensuelles',
      value: '8.2M $',
      change: '-3%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  const recentActivities = [
    { id: 1, type: 'paiement', description: 'John Doe a payé la tranche 1', time: 'Il y a 10 min' },
    { id: 2, type: 'depense', description: 'Achat de matériel scolaire', time: 'Il y a 1 heure' },
    { id: 3, type: 'inscription', description: 'Nouvel élève inscrit en 1ère', time: 'Il y a 2 heures' },
    { id: 4, type: 'budget', description: 'Budget de novembre approuvé', time: 'Il y a 1 jour' },
  ];

  return (
    <>
      <Head title="Tableau de bord" />
      
      <>
        <div className="space-y-6">

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
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
                    <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions rapides */}
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
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
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
                  ))}
                </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Élèves actifs</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paiements ce mois</span>
                    <span className="font-medium">245</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dépenses ce mois</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget restant</span>
                    <span className="font-medium text-green-600">4.3M $</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Link href="/paiements/rapport" className="block">
                      <Button variant="outline" className="w-full">
                        Voir le rapport complet
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    </>
  );
}