import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  BookOpen,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { Pagination } from '@/components/ui/pagination';

interface MouvementCaisse {
  id: number;
  type: 'entree' | 'sortie';
  reference: string;
  libelle: string;
  montant: number;
  mode_paiement: string;
  date: string;
  created_at: string;
  statut?: string;
  eleve?: {
    nom_complet: string;
    matricule: string;
  };
  budget?: {
    nom_complet: string;
  };
  user: {
    name: string;
  };
  details?: {
    beneficiaire?: string;
    categorie?: string;
    tranche?: string;
  };
}

interface CaissePageProps {
  auth: any;
  mouvements: {
    data: MouvementCaisse[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  };
  stats: {
    solde_debut: number;
    total_entrees: number;
    total_sorties: number;
    solde_fin: number;
    nombre_operations: number;
    jour_max_entrees: string;
    jour_max_sorties: string;
  };
  filters: {
    search?: string;
    date_debut?: string;
    date_fin?: string;
    type?: string;
    mode_paiement?: string;
    per_page?: number;
  };
  periodes: Array<{
    label: string;
    date_debut: string;
    date_fin: string;
  }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function CaisseIndex({
  auth,
  mouvements,
  stats,
  filters,
  periodes,
  flash,
}: CaissePageProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [dateDebut, setDateDebut] = useState(filters.date_debut || '');
  const [dateFin, setDateFin] = useState(filters.date_fin || '');
  const [periodeSelectionnee, setPeriodeSelectionnee] = useState('aujourdhui');
  const [exportLoading, setExportLoading] = useState(false);

  // Débounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/caisse', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Appliquer une période prédéfinie
  const appliquerPeriode = (periodeKey: string) => {
    const periode = periodes.find(p => p.label === periodeKey);
    if (periode) {
      setDateDebut(periode.date_debut);
      setDateFin(periode.date_fin);
      router.get('/caisse', {
        ...filters,
        date_debut: periode.date_debut,
        date_fin: periode.date_fin,
      }, {
        preserveState: true,
        replace: true,
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get('/caisse', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDateFilter = () => {
    router.get('/caisse', {
      ...filters,
      date_debut: dateDebut,
      date_fin: dateFin,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    router.get('/caisse', {
      per_page: filters.per_page || 15,
    }, {
      preserveState: true,
      replace: true,
    });
    setSearch('');
    setDateDebut('');
    setDateFin('');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    if (type === 'entree') {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          Entrée
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <TrendingDown className="h-3 w-3 mr-1" />
        Sortie
      </Badge>
    );
  };

  const getModePaiementBadge = (mode: string) => {
    const variants: Record<string, string> = {
      'espèce': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'chèque': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      'virement': 'bg-green-100 text-green-800 hover:bg-green-100',
      'carte': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      'mobile_money': 'bg-pink-100 text-pink-800 hover:bg-pink-100',
    };

    return (
      <Badge variant="outline" className={variants[mode] || ''}>
        {mode}
      </Badge>
    );
  };

 const handleExport = async (format: 'pdf' | 'excel') => {
  setExportLoading(true);
  try {
    const params = new URLSearchParams({
      ...filters,
      search, // Ajoutez la recherche actuelle
      format,
    });

    window.open(`/caisse/export?${params.toString()}`, '_blank');
  } catch (error) {
    console.error('Erreur export:', error);
  } finally {
    setExportLoading(false);
  }
};

  return (
    <>
      <Head title="Journal de caisse" />
      
      <DashboardLayout activeRoute="/caisse">
        <PageHeader
          title="Journal de caisse"
          description="Suivi des entrées et sorties de fonds"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Caisse', href: '/caisse' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {/*<Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={exportLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>*/}
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
              >
                <Printer className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Solde initial</p>
                  <p className={`text-2xl font-bold ${
                    stats.solde_debut >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {formatMontant(stats.solde_debut)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total entrées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMontant(stats.total_entrees)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total sorties</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatMontant(stats.total_sorties)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Solde final</p>
                  <p className={`text-2xl font-bold ${
                    stats.solde_fin >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {formatMontant(stats.solde_fin)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {stats.nombre_operations} opérations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Recherche */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par référence, libellé, bénéficiaire..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="entree">Entrées</SelectItem>
                      <SelectItem value="sortie">Sorties</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.mode_paiement || 'all'}
                    onValueChange={(value) => handleFilterChange('mode_paiement', value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous modes</SelectItem>
                      <SelectItem value="espèce">Espèce</SelectItem>
                      <SelectItem value="chèque">Chèque</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                      <SelectItem value="carte">Carte</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Périodes rapides */}
              <div>
                <Label className="mb-2 block">Périodes rapides</Label>
                <div className="flex flex-wrap gap-2">
                  {periodes.map((periode) => (
                    <Button
                      key={periode.label}
                      variant="outline"
                      size="sm"
                      onClick={() => appliquerPeriode(periode.label)}
                      className={
                        dateDebut === periode.date_debut && dateFin === periode.date_fin
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {periode.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dates spécifiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_debut">Date début</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="date_fin">Date fin</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleDateFilter} className="w-full">
                    Appliquer dates
                  </Button>
                </div>
              </div>

              {/* Ligne inférieure des filtres */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
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
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Affichage {mouvements.from} à {mouvements.to} sur {mouvements.total} mouvements
                  </div>
                </div>

                <div>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Réinitialiser filtres
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des mouvements */}
        <Card>
          <CardHeader>
            <CardTitle>Journal des opérations</CardTitle>
            <CardDescription>
              Liste chronologique des mouvements de caisse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Mode paiement</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mouvements.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Aucun mouvement trouvé</p>
                        <p className="text-sm">Modifiez vos critères de recherche</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mouvements.data.map((mouvement) => (
                      <TableRow key={mouvement.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{formatDate(mouvement.date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(mouvement.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(mouvement.type)}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {mouvement.reference}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{mouvement.libelle}</div>
                          <div className="text-xs text-muted-foreground">
                            Par {mouvement.user.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mouvement.type === 'entree' && mouvement.eleve && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="text-xs">{mouvement.eleve.nom_complet}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Mat: {mouvement.eleve.matricule}
                              </div>
                              {mouvement.details?.tranche && (
                                <Badge variant="outline" className="text-xs">
                                  {mouvement.details.tranche}
                                </Badge>
                              )}
                            </div>
                          )}
                          {mouvement.type === 'sortie' && (
                            <div className="space-y-1">
                              {mouvement.details?.beneficiaire && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span className="text-xs">{mouvement.details.beneficiaire}</span>
                                </div>
                              )}
                              {mouvement.details?.categorie && (
                                <Badge variant="outline" className="text-xs">
                                  {mouvement.details.categorie}
                                </Badge>
                              )}
                              {mouvement.budget && (
                                <div className="text-xs text-muted-foreground">
                                  Budget: {mouvement.budget.nom_complet}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getModePaiementBadge(mouvement.mode_paiement)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`font-bold ${
                            mouvement.type === 'entree' 
                              ? 'text-green-600' 
                              : 'text-destructive'
                          }`}>
                            {mouvement.type === 'entree' ? '+' : '-'}{' '}
                            {formatMontant(mouvement.montant)}
                          </div>
                          {mouvement.statut && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs mt-1"
                            >
                              {mouvement.statut}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {mouvement.type === 'entree' && (
                              <Link href={`/paiements/${mouvement.id}`}>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {mouvement.type === 'sortie' && (
                              <Link href={`/depenses/${mouvement.id}`}>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {mouvements.last_page > 1 && (
              <div className="border-t pt-4 mt-4">
                <Pagination
                  currentPage={mouvements.current_page}
                  totalPages={mouvements.last_page}
                  onPageChange={(page) => {
                    router.get('/caisse', { ...filters, page }, {
                      preserveState: true,
                      replace: true,
                    });
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résumé journalier */}
        {stats.jour_max_entrees && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Analyse</CardTitle>
              <CardDescription>
                Statistiques détaillées des mouvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Journée record</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Plus d'entrées</p>
                          <p className="font-medium">{stats.jour_max_entrees}</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Plus de sorties</p>
                          <p className="font-medium">{stats.jour_max_sorties}</p>
                        </div>
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Répartition</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Entrées</span>
                      <span className="font-medium text-green-600">
                        {formatMontant(stats.total_entrees)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sorties</span>
                      <span className="font-medium text-destructive">
                        {formatMontant(stats.total_sorties)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Solde net</span>
                      <span className={
                        stats.solde_fin >= 0 ? 'text-green-600' : 'text-destructive'
                      }>
                        {formatMontant(stats.solde_fin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </>
  );
}