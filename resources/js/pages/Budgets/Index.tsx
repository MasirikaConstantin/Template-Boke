import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  Download,
  Copy,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Budget {
  id: number;
  annee: string;
  mois: string;
  montant_alloue: number;
  montant_depense: number;
  montant_restant: number;
  description: string | null;
  est_actif: boolean;
  ref: string;
  created_at: string;
  updated_at: string;
  pourcentage_utilise: number;
  est_depasse: boolean;
  nom_complet: string;
}

interface BudgetsPageProps {
  auth: any;
  budgets: {
    data: Budget[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    annee: string;
    mois: string;
    est_actif: string;
    per_page: number;
  };
  stats: {
    total: number;
    total_alloue: number;
    total_depense: number;
    total_restant: number;
    budget_courant: Budget | null;
  };
  annees: string[];
  mois: string[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function BudgetsIndex({
  auth,
  budgets,
  filters,
  stats,
  annees,
  mois,
  flash,
}: BudgetsPageProps) {
  const [search, setSearch] = useState('');

  const handleFilterChange = (key: string, value: string) => {
    router.get('/budgets', { ...filters, [key]: value }, {
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

  const getStatusBadge = (budget: Budget) => {
    if (budget.est_depasse) {
      return (
        <Badge variant="destructive">
          <TrendingUp className="h-3 w-3 mr-1" />
          Dépassé
        </Badge>
      );
    }

    if (Number(budget.pourcentage_utilise) > 80) {
      return (
        <Badge variant="warning">
          <TrendingUp className="h-3 w-3 mr-1" />
          Presque épuisé
        </Badge>
      );
    }

    if (budget.est_actif) {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactif
      </Badge>
    );
  };

  return (
    <>
      <Head title="Gestion des budgets" />
      
      <DashboardLayout activeRoute="/budgets">
        <PageHeader
          title="Budgets mensuels"
          description={`${budgets.total} budgets - Total alloué: ${formatMontant(stats.total_alloue)}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Budgets', href: '/budgets' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/budgets/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau budget
                </Button>
              </Link>
            </div>
          }
        />

        {flash?.success && (
          <Alert className="mb-6">
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        {/* Budget en cours */}
        {stats.budget_courant && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Budget du mois en cours
              </CardTitle>
              <CardDescription>
                {stats.budget_courant.nom_complet}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Montant alloué</p>
                    <p className="text-2xl font-bold">{formatMontant(stats.budget_courant.montant_alloue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dépensé</p>
                    <p className="text-2xl font-bold">{formatMontant(stats.budget_courant.montant_depense)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Restant</p>
                    <p className={`text-2xl font-bold ${
                      stats.budget_courant.montant_restant < 0 ? 'text-destructive' :
                      stats.budget_courant.montant_restant < (stats.budget_courant.montant_alloue * 0.2) ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {formatMontant(stats.budget_courant.montant_restant)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{stats.budget_courant.pourcentage_utilise.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={stats.budget_courant.pourcentage_utilise} 
                    className={`h-2 ${
                      stats.budget_courant.pourcentage_utilise > 100 ? 'bg-destructive' :
                      stats.budget_courant.pourcentage_utilise > 80 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                  />
                </div>

                <div className="flex gap-2">
                  <Link href={`/depenses?budget_id=${stats.budget_courant.id}`}>
                    <Button variant="outline" size="sm">
                      Voir les dépenses
                    </Button>
                  </Link>
                  <Link href={`/depenses/create`}>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Nouvelle dépense
                    </Button>
                  </Link>
                  <Link href={`/budgets/${stats.budget_courant.id}`}>
                    <Button size="sm">
                      Détails
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total budgets</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total alloué</p>
                  <p className="text-2xl font-bold">{formatMontant(stats.total_alloue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total dépensé</p>
                  <p className="text-2xl font-bold">{formatMontant(stats.total_depense)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total restant</p>
                  <p className="text-2xl font-bold">{formatMontant(stats.total_restant)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Select
                  value={filters.annee || ''}
                  onValueChange={(value) => handleFilterChange('annee', value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes années</SelectItem>
                    {annees.map((annee) => (
                      <SelectItem key={annee} value={annee}>
                        {annee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.mois || ''}
                  onValueChange={(value) => handleFilterChange('mois', value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mois" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous mois</SelectItem>
                    {mois.map((mois) => (
                      <SelectItem key={mois} value={mois}>
                        {mois.charAt(0).toUpperCase() + mois.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.est_actif || ''}
                  onValueChange={(value) => handleFilterChange('est_actif', value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.per_page?.toString() || '15'}
                  onValueChange={(value) => handleFilterChange('per_page', value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Par page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des budgets */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant alloué</TableHead>
                  <TableHead className="text-right">Dépensé</TableHead>
                  <TableHead className="text-right">Restant</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucun budget trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  budgets.data.map((budget) => (
                    <TableRow key={budget.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{budget.nom_complet}</div>
                          <div className="text-xs text-muted-foreground">
                            Réf: {budget.ref}
                          </div>
                          {budget.description && (
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                              {budget.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(budget)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMontant(budget.montant_alloue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{formatMontant(budget.montant_depense)}</div>
                        <div className="text-xs text-muted-foreground">
                          {Number(budget.pourcentage_utilise).toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        budget.montant_restant < 0 ? 'text-destructive' :
                        budget.montant_restant < (budget.montant_alloue * 0.2) ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {formatMontant(budget.montant_restant)}
                      </TableCell>
                      <TableCell className="w-48">
                        <div className="space-y-2">
                          <Progress 
                            value={Math.min(100, budget.pourcentage_utilise)} 
                            className={`h-2 ${
                              budget.pourcentage_utilise > 100 ? 'bg-destructive' :
                              budget.pourcentage_utilise > 80 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {(budget.pourcentage_utilise).toFixed(1)}%
                            </span>
                            <span className={
                              budget.est_depasse ? 'text-destructive' :
                              budget.pourcentage_utilise > 80 ? 'text-amber-600' :
                              'text-green-600'
                            }>
                              {budget.est_depasse ? 'Dépassé' :
                               budget.pourcentage_utilise > 80 ? 'Presque épuisé' :
                               'Normal'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/budgets/${budget.id}`}>
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </Link>
                          <Link href={`/depenses?budget_id=${budget.id}`}>
                            <Button variant="outline" size="sm">
                              Dépenses
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {budgets.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={budgets.current_page}
                totalPages={budgets.last_page}
                onPageChange={(page) => {
                  router.get('/budgets', { ...filters, page }, {
                    preserveState: true,
                    replace: true,
                  });
                }}
              />
            </div>
          )}
        </Card>
      </DashboardLayout>
    </>
  );
}