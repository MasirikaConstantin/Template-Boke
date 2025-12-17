// resources/js/Pages/Dashboard/Admin.tsx
import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  CreditCard,
  CalendarDays,
  BookOpen,
  FileText,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  School,
  UserPlus,
  Activity
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';

export default function AdminDashboard() {
  // Données génériques
  const stats = {
    totalEleves: 845,
    totalProfesseurs: 58,
    totalClasses: 24,
    tauxPresence: 92.5,
    tauxReussite: 86.3,
    budgetUtilise: 68.2,
    revenusMensuels: 125400,
    depensesMensuelles: 98450,
    eventsThisWeek: 8,
    tasksPending: 12
  };

  const recentActivities = [
    { id: 1, user: 'M. Dubois', action: 'a ajouté une nouvelle note', time: '2 min', icon: FileText },
    { id: 2, user: 'Mme. Martin', action: 'a enregistré une absence', time: '15 min', icon: Users },
    { id: 3, user: 'Élève Dupont', action: 'a payé les frais scolaires', time: '1 heure', icon: CreditCard },
    { id: 4, user: 'Système', action: 'rapport mensuel généré', time: '2 heures', icon: BarChart3 },
    { id: 5, user: 'Admin', action: 'a créé un nouvel utilisateur', time: '4 heures', icon: UserPlus },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Conseil de classe', date: 'Aujourd\'hui, 14h', classe: 'Terminale S' },
    { id: 2, title: 'Réunion parents-professeurs', date: 'Demain, 18h', classe: 'Toutes' },
    { id: 3, title: 'Examens trimestriels', date: '15-20 Mars', classe: 'Toutes' },
    { id: 4, title: 'Sortie pédagogique', date: '22 Mars', classe: '4ème' },
  ];

  return (
    <>
      <Head title="Tableau de bord administratif" />
      
      <>
        <div className="space-y-6">
          {/* En-tête */}
          

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Élèves</p>
                    <p className="text-2xl font-bold">{stats.totalEleves}</p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+3.2%</span>
                      <span className="text-muted-foreground">ce mois</span>
                    </div>
                  </div>
                  <Users className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de présence</p>
                    <p className="text-2xl font-bold">{stats.tauxPresence}%</p>
                    <Progress value={stats.tauxPresence} className="h-2 mt-2" />
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget utilisé</p>
                    <p className="text-2xl font-bold">{stats.budgetUtilise}%</p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {stats.budgetUtilise > 75 ? (
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-600" />
                      )}
                      <span className={stats.budgetUtilise > 75 ? 'text-amber-600' : 'text-green-600'}>
                        {stats.budgetUtilise > 75 ? 'Attention' : 'Bon contrôle'}
                      </span>
                    </div>
                  </div>
                  <CreditCard className="h-10 w-10 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de réussite</p>
                    <p className="text-2xl font-bold">{stats.tauxReussite}%</p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+2.1%</span>
                      <span className="text-muted-foreground">vs dernier trim.</span>
                    </div>
                  </div>
                  <GraduationCap className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques et détails */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Graphique des finances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Aperçu financier
                  </CardTitle>
                  <CardDescription>
                    Revenus vs Dépenses - Mars 2024
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenus mensuels</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.revenusMensuels.toLocaleString('fr-FR')} $
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dépenses mensuelles</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {stats.depensesMensuelles.toLocaleString('fr-FR')} $
                        </p>
                      </div>
                    </div>
                    
                    {/* Barre de progression simulée */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Salaires</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-3" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Fournitures</span>
                        <span>20%</span>
                      </div>
                      <Progress value={20} className="h-3" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Maintenance</span>
                        <span>10%</span>
                      </div>
                      <Progress value={10} className="h-3" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Divers</span>
                        <span>5%</span>
                      </div>
                      <Progress value={5} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activités récentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activités récentes
                  </CardTitle>
                  <CardDescription>
                    Dernières actions dans le système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              <span className="text-primary">{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Il y a {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Événements à venir */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Événements à venir
                  </CardTitle>
                  <CardDescription>
                    {stats.eventsThisWeek} événements cette semaine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{event.date}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{event.classe}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alertes et notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Alertes importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Absences non justifiées</p>
                      <p className="text-sm text-amber-700">12 élèves avec +3 absences ce mois</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Échéances de paiement</p>
                      <p className="text-sm text-blue-700">24 frais en attente de paiement</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Notes en retard</p>
                      <p className="text-sm text-red-700">3 professeurs n'ont pas saisi leurs notes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Générer rapport mensuel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Ajouter un nouvel élève
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <School className="h-4 w-4 mr-2" />
                    Créer une nouvelle classe
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Envoyer des factures
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    </>
  );
}