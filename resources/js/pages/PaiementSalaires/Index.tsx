import React, { useState, useEffect } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  Clock,
  CalendarDays,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  CreditCard,
  Calculator,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Professeur {
  id: number;
  nom: string;
  email: string;
}

interface ProfSalaire {
  id: number;
  type_salaire: string;
}

interface PaiementSalaire {
  id: number;
  ref: string;
  professeur_id: number;
  prof_salaire_id: number;
  type_paiement: 'normal' | 'avance' | 'regularisation';
  montant: number;
  date_paiement: string;
  periode: string;
  statut: 'en_attente' | 'paye';
  statut_label: string;
  statut_color: string;
  type_paiement_label: string;
  formatted_montant: string;
  formatted_date: string;
  formatted_periode: string;
  salaire_base: number;
  avances_deduites: number;
  retenues: number;
  net_a_payer: number;
  heures_travaillees: number | null;
  created_at: string;
  updated_at: string;
  professeur: Professeur;
  profSalaire: ProfSalaire;
}

interface PaiementSalairesPageProps {
  auth: any;
  paiements: {
    data: PaiementSalaire[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    professeur_id: string;
    type_paiement: string;
    statut: string;
    periode: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    paye: number;
    en_attente: number;
    total_montant: number;
    total_net_a_payer: number;
  };
  professeurs: Professeur[];
  periodes: Array<{
    value: string;
    label: string;
  }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function PaiementSalairesIndex({
  auth,
  paiements,
  filters,
  stats,
  professeurs,
  periodes,
  flash,
}: PaiementSalairesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/paiement-salaires', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/paiement-salaires', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paiements.data.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedIds.length} élément(s) ?`)) {
      router.post('/paiement-salaires/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (item: PaiementSalaire) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce paiement de ${item.formatted_montant} ?`)) {
      router.delete(`/paiement-salaires/${item.id}`);
    }
  };

  const getStatutBadge = (paiement: PaiementSalaire) => {
    const variants = {
      paye: { variant: 'success' as const, icon: CheckCircle },
      en_attente: { variant: 'warning' as const, icon: Clock },
    };

    const { variant, icon: Icon } = variants[paiement.statut] || { variant: 'outline' as const, icon: Clock };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {paiement.statut_label}
      </Badge>
    );
  };

  const getTypePaiementBadge = (type: string) => {
    const variants = {
      normal: { variant: 'default' as const, label: 'Salaire normal' },
      avance: { variant: 'secondary' as const, label: 'Avance' },
      regularisation: { variant: 'outline' as const, label: 'Régularisation' },
    };

    const { variant, label } = variants[type as keyof typeof variants] || { variant: 'outline' as const, label: type };

    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <Head title="Gestion des paiements de salaires" />
      
      <DashboardLayout activeRoute="/depenses">
        <PageHeader
          title="Paiements de salaires"
          description={`${paiements.total} paiements - ${formatCurrency(stats.total_net_a_payer)} total net`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Finances', href: '#' },
            { label: 'Paiements', href: '/paiement-salaires' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Actions ({selectedIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('mark_paye')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer comme payé
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('mark_en_attente')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Marquer comme en attente
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction('delete')}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Link href="/paiement-salaires/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau paiement
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total paiements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payés</p>
                <p className="text-2xl font-bold">{stats.paye}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.en_attente}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total net</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_net_a_payer)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un professeur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtres supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={filters.professeur_id || ''}
                onValueChange={(value) => handleFilterChange('professeur_id', value)}
              >
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Professeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous professeurs</SelectItem>
                  {professeurs.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id.toString()}>
                      {prof.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type_paiement || ''}
                onValueChange={(value) => handleFilterChange('type_paiement', value)}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="normal">Salaire normal</SelectItem>
                  <SelectItem value="avance">Avance</SelectItem>
                  <SelectItem value="regularisation">Régularisation</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.statut || ''}
                onValueChange={(value) => handleFilterChange('statut', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.periode || ''}
                onValueChange={(value) => handleFilterChange('periode', value)}
              >
                <SelectTrigger>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes périodes</SelectItem>
                  {periodes.map((periode) => (
                    <SelectItem key={periode.value} value={periode.value}>
                      {periode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.per_page?.toString() || '10'}
                onValueChange={(value) => handleFilterChange('per_page', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Par page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === paiements.data.length && paiements.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date paiement</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiements.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucun paiement trouvé</p>
                      <p className="text-sm mt-2">
                        {filters.search ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer un nouveau paiement'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paiements.data.map((paiement) => (
                    <TableRow key={paiement.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(paiement.id)}
                          onCheckedChange={(checked) => handleSelectItem(paiement.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{paiement.formatted_periode}</div>
                        {paiement.heures_travaillees && (
                          <div className="text-xs text-muted-foreground">
                            {paiement.heures_travaillees}h travaillées
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {paiement.professeur.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{paiement.professeur.nom}</div>
                            <div className="text-xs text-muted-foreground">
                              {paiement.professeur.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypePaiementBadge(paiement.type_paiement)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-lg">
                            {paiement.formatted_montant}
                          </div>
                          {paiement.type_paiement === 'normal' && (
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Base:</span>
                                <span>{formatCurrency(paiement.salaire_base)}</span>
                              </div>
                              {paiement.avances_deduites > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avances:</span>
                                  <span className="text-red-600">-{formatCurrency(paiement.avances_deduites)}</span>
                                </div>
                              )}
                              {paiement.retenues > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Retenues:</span>
                                  <span className="text-red-600">-{formatCurrency(paiement.retenues)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(paiement)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(paiement.date_paiement)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {paiement.ref}
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
                            <Link href={`/paiement-salaires/${paiement.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/paiement-salaires/${paiement.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/paiement-salaires/${paiement.id}/bulletin`}>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Bulletin de paie
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(paiement)}
                              className="text-destructive"
                            >
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

          {/* Pagination */}
          {paiements.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={paiements.current_page}
                totalPages={paiements.last_page}
                onPageChange={(page) => {
                  router.get('/paiement-salaires', { ...filters, page }, {
                    preserveState: true,
                    replace: true,
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calcul rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Période courante</div>
                <div className="font-medium text-lg">
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Professeurs actifs</div>
                <div className="font-medium text-lg">{professeurs.length}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Moyenne par paiement</div>
                <div className="font-medium text-lg">
                  {stats.total > 0 ? formatCurrency(stats.total_net_a_payer / stats.total) : '0,00 $'}
                </div>
              </div>
              <Link href="/paiement-salaires/create" className="w-full">
                <Button className="w-full h-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculer salaires
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}