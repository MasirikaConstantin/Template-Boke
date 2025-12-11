import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  CreditCard,
  Users,
  DollarSign
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface PaiementRapport {
  id: number;
  reference: string;
  montant: number;
  mode_paiement: string;
  date_paiement: string;
  eleve?: {
    nom: string;
    prenom: string;
  };
}

interface RapportStats {
  total: number;
  montant_total: number;
  par_mode: Record<string, { count: number; total: number }>;
  par_jour: Array<{
    date: string;
    count: number;
    total: number;
  }>;
}

interface PaiementsRapportProps {
  auth: any;
  paiements: PaiementRapport[];
  filters: {
    date_debut: string;
    date_fin: string;
  };
  stats: RapportStats;
}

export default function PaiementsRapport({ 
  auth, 
  paiements, 
  filters, 
  stats 
}: PaiementsRapportProps) {
  const [dateRange, setDateRange] = useState({
    debut: filters.date_debut || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    fin: filters.date_fin || new Date().toISOString().split('T')[0],
  });

  const handleDateRangeChange = () => {
    router.get('/paiements/rapport', { 
      date_debut: dateRange.debut,
      date_fin: dateRange.fin 
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Préparation des données pour les graphiques
  const dataParMode = Object.entries(stats.par_mode).map(([mode, data]) => ({
    name: mode.charAt(0).toUpperCase() + mode.slice(1),
    count: data.count,
    total: data.total,
    color: getModeColor(mode)
  }));

  const dataParJour = stats.par_jour.map(item => ({
    date: formatDate(item.date),
    count: item.count,
    total: item.total
  }));

  function getModeColor(mode: string) {
    switch (mode) {
      case 'espèce': return '#10b981';
      case 'chèque': return '#3b82f6';
      case 'virement': return '#8b5cf6';
      case 'mobile_money': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <>
      <Head title="Rapport des paiements" />
      
      <DashboardLayout activeRoute="/paiements">
        <PageHeader
          title="Rapport des paiements"
          description="Analyse et statistiques des paiements"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Paiements', href: '/paiements' },
            { label: 'Rapport', href: '/paiements/rapport' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
              <Link href="/paiements">
                <Button variant="outline">
                  Retour aux paiements
                </Button>
              </Link>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres du rapport
              </CardTitle>
              <CardDescription>
                Sélectionnez la période d'analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={dateRange.debut}
                      onChange={(e) => setDateRange({...dateRange, debut: e.target.value})}
                      placeholder="Date début"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={dateRange.fin}
                      onChange={(e) => setDateRange({...dateRange, fin: e.target.value})}
                      placeholder="Date fin"
                      className="w-full"
                    />
                  </div>
                  <Button onClick={handleDateRangeChange}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Appliquer
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Période: {formatDate(dateRange.debut)} - {formatDate(dateRange.fin)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total paiements</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Montant total</p>
                    <p className="text-2xl font-bold">{formatMontant(stats.montant_total)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne par jour</p>
                    <p className="text-2xl font-bold">
                      {stats.par_jour.length > 0 
                        ? formatMontant(stats.montant_total / stats.par_jour.length)
                        : formatMontant(0)
                      }
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Modes de paiement</p>
                    <p className="text-2xl font-bold">{Object.keys(stats.par_mode).length}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique par mode de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Répartition par mode de paiement
                </CardTitle>
                <CardDescription>
                  Distribution des paiements selon le mode utilisé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataParMode}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${formatMontant(entry.total)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {dataParMode.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatMontant(Number(value)), 'Montant']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {dataParMode.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.count} paiements • {formatMontant(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Graphique évolution quotidienne */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Évolution quotidienne
                </CardTitle>
                <CardDescription>
                  Montant total des paiements par jour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataParJour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => formatMontant(value).replace('$US', 'K')}
                      />
                      <Tooltip 
                        formatter={(value) => [formatMontant(Number(value)), 'Montant']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="total" 
                        name="Montant total" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Graphique linéaire du nombre de paiements */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Nombre de paiements par jour
                </CardTitle>
                <CardDescription>
                  Évolution du volume de paiements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataParJour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Nombre de paiements" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails des paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Détails des paiements</CardTitle>
              <CardDescription>
                Liste complète des {paiements.length} paiements sur la période
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Référence</th>
                      <th className="text-left py-3 px-4">Élève</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Mode</th>
                      <th className="text-left py-3 px-4">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map((paiement) => (
                      <tr key={paiement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono">{paiement.reference}</td>
                        <td className="py-3 px-4">
                          {paiement.eleve 
                            ? `${paiement.eleve.nom} ${paiement.eleve.prenom}`
                            : 'Non assigné'
                          }
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(paiement.date_paiement)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            paiement.mode_paiement === 'espèce' ? 'bg-green-100 text-green-800' :
                            paiement.mode_paiement === 'chèque' ? 'bg-blue-100 text-blue-800' :
                            paiement.mode_paiement === 'virement' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {paiement.mode_paiement}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatMontant(paiement.montant)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50">
                      <td colSpan={4} className="py-3 px-4 text-right font-medium">
                        Total:
                      </td>
                      <td className="py-3 px-4 font-bold text-lg">
                        {formatMontant(stats.montant_total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}