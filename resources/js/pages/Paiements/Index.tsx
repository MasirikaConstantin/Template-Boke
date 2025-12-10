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
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Receipt,
  BarChart,
  Clock,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rapport } from '@/routes/paiements';

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  ref: string;
}

interface Tranche {
  id: number;
  nom_tranche: string;
  configuration_frais?: {
    nom_frais: string;
  };
}

interface Paiement {
  id: number;
  eleve_id: number | null;
  tranche_id: number | null;
  user_id: number;
  reference: string;
  montant: number;
  mode_paiement: 'espèce' | 'chèque' | 'virement' | 'mobile_money';
  numero_cheque: string | null;
  commentaire: string | null;
  date_paiement: string;
  created_at: string;
  updated_at: string;
  eleve?: Eleve;
  tranche?: Tranche;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface PaiementsPageProps {
  auth: any;
  paiements: {
    data: Paiement[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    eleve_id: string;
    tranche_id: string;
    mode_paiement: string;
    date_debut: string;
    date_fin: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    montant_total: number;
    par_mode: Record<string, { count: number; total: number }>;
    recent: Paiement[];
    aujourdhui: { count: number; total: number };
    ce_mois: { count: number; total: number };
  };
  eleves: Eleve[];
  tranches: Tranche[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function PaiementsIndex({
  auth,
  paiements,
  filters,
  stats,
  eleves,
  tranches,
  flash,
}: PaiementsPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');
  const [dateRange, setDateRange] = useState({
    debut: filters.date_debut || '',
    fin: filters.date_fin || '',
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/paiements', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/paiements', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDateRangeChange = () => {
    router.get('/paiements', { 
      ...filters, 
      date_debut: dateRange.debut,
      date_fin: dateRange.fin 
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paiements.data.map(paiement => paiement.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectPaiement = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedIds.length} paiement(s) ?`)) {
      router.post('/paiements/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (paiement: Paiement) => {
    if (confirm(`Êtes-vous sûr de vouloir annuler le paiement "${paiement.reference}" ?`)) {
      router.delete(`/paiements/${paiement.id}`);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
    }).format(montant);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getModePaiementBadge = (mode: string) => {
    const variants = {
      'espèce': 'default',
      'chèque': 'secondary',
      'virement': 'outline',
      'mobile_money': 'default'
    } as const;

    const colors = {
      'espèce': 'bg-green-100 text-green-800 border-green-200',
      'chèque': 'bg-blue-100 text-blue-800 border-blue-200',
      'virement': 'bg-purple-100 text-purple-800 border-purple-200',
      'mobile_money': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <Badge variant={variants[mode] || 'outline'} className={`${colors[mode]} border`}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Head title="Gestion des paiements" />
      
      <DashboardLayout activeRoute="/paiements">
        <PageHeader
          title="Paiements"
          description={`${paiements.total} paiements - Total: ${formatMontant(stats.montant_total)}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Paiements', href: '/paiements' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Receipt className="h-4 w-4 mr-2" />
                      Actions ({selectedIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
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
              <Link href={rapport().url}>
                <Button variant="outline">
                  <BarChart className="h-4 w-4 mr-2" />
                  Rapport
                </Button>
              </Link>
              <Link href="/paiements/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau paiement
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total paiements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMontant(stats.montant_total)}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.aujourdhui.count}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMontant(stats.aujourdhui.total)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{stats.ce_mois.count}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMontant(stats.ce_mois.total)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Par mode</p>
                <div className="flex gap-1 mt-1">
                  {Object.entries(stats.par_mode).map(([mode, data]) => (
                    <Badge key={mode} variant="outline" className="text-xs">
                      {data.count}
                    </Badge>
                  ))}
                </div>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par référence ou élève..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Select
                  value={filters.mode_paiement || ''}
                  onValueChange={(value) => handleFilterChange('mode_paiement', value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous modes</SelectItem>
                    <SelectItem value="espèce">Espèce</SelectItem>
                    <SelectItem value="chèque">Chèque</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.eleve_id || ''}
                  onValueChange={(value) => handleFilterChange('eleve_id', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Élève" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les élèves</SelectItem>
                    {eleves.map((eleve) => (
                      <SelectItem key={eleve.id} value={eleve.id.toString()}>
                        {eleve.nom} {eleve.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.tranche_id || ''}
                  onValueChange={(value) => handleFilterChange('tranche_id', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <FileText className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tranche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes tranches</SelectItem>
                    {tranches.map((tranche) => (
                      <SelectItem key={tranche.id} value={tranche.id.toString()}>
                        {tranche.nom_tranche}
                        {tranche.configuration_frais && ` (${tranche.configuration_frais.nom_frais})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
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
                <Button onClick={handleDateRangeChange} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>

              <div className="flex gap-2 ml-auto">
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
          </div>
        </div>

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
                  <TableHead>Référence</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Tranche</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Enregistré par</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiements.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucun paiement trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paiements.data.map((paiement) => (
                    <TableRow key={paiement.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(paiement.id)}
                          onCheckedChange={(checked) => handleSelectPaiement(paiement.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium font-mono">{paiement.reference}</div>
                          {paiement.numero_cheque && (
                            <div className="text-xs text-muted-foreground">
                              Chèque: {paiement.numero_cheque}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {paiement.eleve ? (
                          <div>
                            <div className="font-medium">
                              {paiement.eleve.nom} {paiement.eleve.prenom}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Réf: {paiement.eleve.ref}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {paiement.tranche ? (
                          <div>
                            <div className="font-medium">{paiement.tranche.nom_tranche}</div>
                            {paiement.tranche.configuration_frais && (
                              <div className="text-xs text-muted-foreground">
                                {paiement.tranche.configuration_frais.nom_frais}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Non spécifiée</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMontant(paiement.montant)}
                      </TableCell>
                      <TableCell>
                        {getModePaiementBadge(paiement.mode_paiement)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(paiement.date_paiement)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{paiement.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(paiement.created_at)}
                          </div>
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
                            <Link href={`/paiements/${paiement.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/paiements/${paiement.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(paiement)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Annuler
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

          {paiements.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={paiements.current_page}
                totalPages={paiements.last_page}
                onPageChange={(page) => {
                  router.get('/paiements', { ...filters, page }, {
                    preserveState: true,
                    replace: true,
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Paiements récents */}
        {stats.recent.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Paiements récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recent.map((paiement) => (
                  <div key={paiement.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{paiement.reference}</div>
                        <div className="text-sm text-muted-foreground">
                          {paiement.eleve ? `${paiement.eleve.nom} ${paiement.eleve.prenom}` : 'Non assigné'} • {formatMontant(paiement.montant)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {formatDate(paiement.date_paiement)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </>
  );
}