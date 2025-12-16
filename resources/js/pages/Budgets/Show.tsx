import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileText,
  Download,
  Printer,
  Edit,
  MoreVertical,
  Eye,
  Trash2,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  CreditCard,
  Receipt,
  Percent,
  BarChart3,
  Target,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface CategorieDepense {
  id: number;
  nom: string;
  description: string | null;
  ref: string;
}

interface Depense {
  id: number;
  reference: string;
  libelle: string;
  montant: number;
  mode_paiement: 'espèce' | 'chèque' | 'virement' | 'carte';
  beneficiaire: string;
  description: string | null;
  date_depense: string;
  numero_piece: string | null;
  fichier_joint: string | null;
  statut: 'brouillon' | 'en_attente' | 'approuve' | 'rejete' | 'paye';
  statut_label: string;
  statut_color: string;
  ref: string;
  created_at: string;
  updated_at: string;
  user: User;
  categorie_depense: CategorieDepense | null;
}

interface BudgetShowProps {
  budget: Budget;
  depenses: {
    data: Depense[];
    total: number;
    par_categorie: Array<{
      categorie: string;
      montant: number;
      pourcentage: number;
      count: number;
    }>;
    par_statut: Array<{
      statut: string;
      count: number;
      montant: number;
    }>;
    recentes: Depense[];
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function BudgetShow({ budget, depenses, flash }: BudgetShowProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calcul des statistiques
  const pourcentageDepense = (budget.montant_depense / budget.montant_alloue) * 100;
  const pourcentageRestant = (budget.montant_restant / budget.montant_alloue) * 100;

  // Formatter les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoisLabel = (mois: string) => {
    const moisLabels: { [key: string]: string } = {
      'janvier': 'Janvier',
      'fevrier': 'Février',
      'mars': 'Mars',
      'avril': 'Avril',
      'mai': 'Mai',
      'juin': 'Juin',
      'juillet': 'Juillet',
      'aout': 'Août',
      'septembre': 'Septembre',
      'octobre': 'Octobre',
      'novembre': 'Novembre',
      'decembre': 'Décembre'
    };
    return moisLabels[mois] || mois;
  };

  const getStatutBadge = (statut: string) => {
    const variants = {
      brouillon: { variant: 'secondary' as const, icon: FileText },
      en_attente: { variant: 'warning' as const, icon: Clock },
      approuve: { variant: 'info' as const, icon: CheckCircle },
      rejete: { variant: 'destructive' as const, icon: AlertCircle },
      paye: { variant: 'success' as const, icon: CheckCircle },
    };

    const { variant, icon: Icon } = variants[statut as keyof typeof variants] || 
      { variant: 'outline' as const, icon: FileText };

    const labels: { [key: string]: string } = {
      brouillon: 'Brouillon',
      en_attente: 'En attente',
      approuve: 'Approuvé',
      rejete: 'Rejeté',
      paye: 'Payé',
    };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {labels[statut] || statut}
      </Badge>
    );
  };

  const getModePaiementIcon = (mode: string) => {
    const icons: { [key: string]: any } = {
      'espèce': DollarSign,
      'chèque': FileText,
      'virement': TrendingUp,
      'carte': CreditCard,
    };
    const Icon = icons[mode] || CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  const getBudgetStatusColor = () => {
    if (pourcentageDepense >= 90) return 'text-red-600';
    if (pourcentageDepense >= 75) return 'text-amber-600';
    return 'text-green-600';
  };

  const getBudgetStatusLabel = () => {
    if (pourcentageDepense >= 90) return 'Danger';
    if (pourcentageDepense >= 75) return 'Attention';
    if (pourcentageDepense >= 50) return 'Modéré';
    return 'Bon';
  };

  return (
    <>
      <Head title={`Budget ${budget.mois} ${budget.annee}`} />
      
      <DashboardLayout activeRoute="/budgets">
        <PageHeader
          title={`Budget ${getMoisLabel(budget.mois)} ${budget.annee}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Finances', href: '#' },
            { label: 'Budgets', href: '/budgets' },
            { label: `${budget.mois} ${budget.annee}`, href: `/budgets/${budget.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/budgets">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/budgets/${budget.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          }
        />

        {/* Alertes */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistiques principales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Vue d'ensemble
                </CardTitle>
                <CardDescription>
                  Référence: <span className="font-mono">{budget.ref}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progression du budget */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Utilisation du budget</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getBudgetStatusColor()}`}>
                          {pourcentageDepense.toFixed(1)}%
                        </span>
                        <Badge variant="outline">
                          {getBudgetStatusLabel()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Restant</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(budget.montant_restant)}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={pourcentageDepense} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Alloué</p>
                      <p className="font-semibold">{formatCurrency(budget.montant_alloue)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Dépensé</p>
                      <p className="font-semibold text-amber-600">{formatCurrency(budget.montant_depense)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Restant</p>
                      <p className="font-semibold text-green-600">{formatCurrency(budget.montant_restant)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Période</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p className="font-medium">
                        {getMoisLabel(budget.mois)} {budget.annee}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <div className="flex items-center gap-2">
                      {budget.est_actif ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nombre de dépenses</p>
                    <p className="font-medium">{depenses.total}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Moyenne par dépense</p>
                    <p className="font-medium">
                      {depenses.total > 0 
                        ? formatCurrency(budget.montant_depense / depenses.total)
                        : formatCurrency(0)
                      }
                    </p>
                  </div>
                </div>

                {/* Description */}
                {budget.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {budget.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground flex justify-between">
                <span>Créé le: {formatDateTime(budget.created_at)}</span>
                {budget.updated_at !== budget.created_at && (
                  <span>Modifié le: {formatDateTime(budget.updated_at)}</span>
                )}
              </CardFooter>
            </Card>

            {/* Onglets pour les dépenses */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="depenses">
                  <Receipt className="h-4 w-4 mr-2" />
                  Dépenses ({depenses.total})
                </TabsTrigger>
                <TabsTrigger value="recentes">
                  <Clock className="h-4 w-4 mr-2" />
                  Récentes
                </TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6 pt-6">
                {/* Répartition par catégorie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Répartition par catégorie
                    </CardTitle>
                    <CardDescription>
                      Distribution des dépenses selon les catégories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {depenses.par_categorie.length > 0 ? (
                        depenses.par_categorie.map((categorie, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{
                                    backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                                  }}
                                />
                                <span className="text-sm font-medium">
                                  {categorie.categorie || 'Non catégorisé'}
                                </span>
                              </div>
                              <div className="text-sm text-right">
                                <div className="font-medium">{formatCurrency(categorie.montant)}</div>
                                <div className="text-muted-foreground">
                                  {categorie.count} dépense{categorie.count > 1 ? 's' : ''} • {categorie.pourcentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <Progress value={categorie.pourcentage} className="h-2" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <PieChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Aucune dépense catégorisée</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Répartition par statut */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Répartition par statut
                    </CardTitle>
                    <CardDescription>
                      Distribution des dépenses selon leur statut
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {depenses.par_statut.length > 0 ? (
                        depenses.par_statut.map((statut, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatutBadge(statut.statut)}
                              <div>
                                <div className="text-sm font-medium">
                                  {statut.count} dépense{statut.count > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(statut.montant)}</div>
                              <div className="text-xs text-muted-foreground">
                                {((statut.montant / budget.montant_depense) * 100).toFixed(1)}% du total
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Aucune statistique disponible</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Toutes les dépenses */}
              <TabsContent value="depenses" className="space-y-6 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Toutes les dépenses
                      </div>
                      <Badge variant="outline">
                        {depenses.total} dépense{depenses.total > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Libellé</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {depenses.data.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Aucune dépense enregistrée</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            depenses.data.map((depense) => (
                              <TableRow key={depense.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="font-medium text-sm">{depense.reference}</div>
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {depense.ref}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{depense.libelle}</div>
                                  {depense.description && (
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                                      {depense.description}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {depense.categorie_depense ? (
                                    <Badge variant="outline">
                                      {depense.categorie_depense.nom}
                                    </Badge>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">Non catégorisé</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold">{formatCurrency(depense.montant)}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    {getModePaiementIcon(depense.mode_paiement)}
                                    {depense.mode_paiement}
                                  </div>
                                </TableCell>
                                <TableCell>{getStatutBadge(depense.statut)}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {formatDate(depense.date_depense)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <Link href={`/depenses/${depense.id}`}>
                                        <DropdownMenuItem>
                                          <Eye className="h-4 w-4 mr-2" />
                                          Voir détails
                                        </DropdownMenuItem>
                                      </Link>
                                      <Link href={`/depenses/${depense.id}/edit`}>
                                        <DropdownMenuItem>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Modifier
                                        </DropdownMenuItem>
                                      </Link>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href="/depenses/create?budget_id={budget.id}">
                      <Button variant="outline">
                        <Receipt className="h-4 w-4 mr-2" />
                        Nouvelle dépense
                      </Button>
                    </Link>
                    <Link href="/depenses?budget_id={budget.id}">
                      <Button variant="ghost">
                        Voir toutes les dépenses
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Dépenses récentes */}
              <TabsContent value="recentes" className="space-y-6 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Dépenses récentes
                    </CardTitle>
                    <CardDescription>
                      Les 5 dernières dépenses enregistrées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {depenses.recentes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Aucune dépense récente</p>
                        </div>
                      ) : (
                        depenses.recentes.map((depense) => (
                          <div key={depense.id} className="border rounded-lg p-4 hover:bg-muted/50">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {getModePaiementIcon(depense.mode_paiement)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{depense.libelle}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {depense.reference} • {depense.beneficiaire}
                                    </div>
                                  </div>
                                </div>
                                
                                {depense.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {depense.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-lg">{formatCurrency(depense.montant)}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  {getStatutBadge(depense.statut)}
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(depense.date_depense)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3" />
                                <span className="text-muted-foreground">Créée par:</span>
                                <span className="font-medium">{depense.user.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Link href={`/depenses/${depense.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Voir
                                  </Button>
                                </Link>
                                <Link href={`/depenses/${depense.id}/edit`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Modifier
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Résumé rapide */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Budget alloué</p>
                  <p className="text-2xl font-bold">{formatCurrency(budget.montant_alloue)}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Dépenses réalisées</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-amber-600">
                      {formatCurrency(budget.montant_depense)}
                    </p>
                    <Badge variant="outline">
                      {pourcentageDepense.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Budget restant</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(budget.montant_restant)}
                    </p>
                    <Badge variant="outline">
                      {pourcentageRestant.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                
                {budget.montant_restant < (budget.montant_alloue * 0.1) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Attention: Moins de 10% du budget restant
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/budgets/${budget.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier le budget
                  </Button>
                </Link>
                
                <Link href="/depenses/create?budget_id={budget.id}" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Nouvelle dépense
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer rapport
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
                
                <Separator />
                
                <Link href="/budgets" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à la liste
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Statistiques supplémentaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Jours restants</span>
                    <span className="font-medium">
                      {(() => {
                        const now = new Date();
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        const diffDays = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 3600 * 24));
                        return diffDays > 0 ? diffDays : 0;
                      })()} jours
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dépenses journalières moyennes</span>
                    <span className="font-medium">
                      {depenses.total > 0 
                        ? formatCurrency(budget.montant_depense / depenses.total)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget journalier restant</span>
                    <span className="font-medium text-green-600">
                      {(() => {
                        const now = new Date();
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        const diffDays = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 3600 * 24));
                        return diffDays > 0 
                          ? formatCurrency(budget.montant_restant / diffDays)
                          : formatCurrency(0);
                      })()}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Tendance</p>
                  <div className="flex items-center gap-2">
                    {budget.montant_depense > (budget.montant_alloue * 0.75) ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">Dépenses élevées</span>
                      </>
                    ) : budget.montant_depense > (budget.montant_alloue * 0.5) ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600">Dépenses modérées</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Dépenses contrôlées</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations techniques */}
            <Card>
              <CardHeader>
                <CardTitle>Informations techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Référence:</span>
                  <span className="font-mono">{budget.ref}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{budget.id}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Statut:</span>
                  {budget.est_actif ? (
                    <Badge variant="success">Actif</Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Créé le:</span>
                  <span>{formatDate(budget.created_at)}</span>
                </div>
                
                {budget.updated_at !== budget.created_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Modifié le:</span>
                    <span>{formatDate(budget.updated_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}