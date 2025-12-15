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
  TrendingDown,
  Calendar,
  Wallet,
  Folder,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Budget {
  id: number;
  nom_complet: string;
}

interface CategorieDepense {
  id: number;
  nom_categorie: string;
}

interface Depense {
  id: number;
  budget_id: number;
  categorie_depense_id: number;
  user_id: number;
  reference: string;
  libelle: string;
  montant: number;
  mode_paiement: string;
  beneficiaire: string;
  description: string | null;
  date_depense: string;
  numero_piece: string | null;
  fichier_joint: string | null;
  statut: string;
  created_at: string;
  updated_at: string;
  budget?: Budget;
  categorie?: CategorieDepense;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface DepensesPageProps {
  auth: any;
  depenses: {
    data: Depense[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    budget_id: string;
    categorie_id: string;
    statut: string;
    date_debut: string;
    date_fin: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    montant_total: number;
    par_statut: Record<string, { count: number; total: number }>;
    par_categorie: Record<string, { count: number; total: number }>;
    aujourdhui: { count: number; total: number };
    ce_mois: { count: number; total: number };
  };
  budgets: Budget[];
  categories: CategorieDepense[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function DepensesIndex({
  auth,
  depenses,
  filters,
  stats,
  budgets,
  categories,
  flash,
}: DepensesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');
  const [dateRange, setDateRange] = useState({
    debut: filters.date_debut || '',
    fin: filters.date_fin || '',
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/depenses', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/depenses', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDateRangeChange = () => {
    router.get('/depenses', { 
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
      setSelectedIds(depenses.data.map(depense => depense.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectDepense = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleDelete = (depense: Depense) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${depense.libelle}" ?`)) {
      router.delete(`/depenses/${depense.id}`);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutBadge = (statut: string) => {
    const badges = {
      brouillon: { variant: 'secondary' as const, icon: <FileText className="h-3 w-3 mr-1" /> },
      en_attente: { variant: 'warning' as const, icon: <Clock className="h-3 w-3 mr-1" /> },
      approuve: { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejete: { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3 mr-1" /> },
      paye: { variant: 'success' as const, icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    };

    const badge = badges[statut] || { variant: 'secondary' as const, icon: null };
    const label = statut.charAt(0).toUpperCase() + statut.slice(1).replace('_', ' ');

    return (
      <Badge variant={badge.variant}>
        {badge.icon}
        {label}
      </Badge>
    );
  };

  return (
    <>
      <Head title="Gestion des dépenses" />
      
      <DashboardLayout activeRoute="/depenses">
        <PageHeader
          title="Dépenses"
          description={`${depenses.total} dépenses - Total: ${formatMontant(stats.montant_total)}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Budgets', href: '/budgets' },
            { label: 'Dépenses', href: '/depenses' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/depenses/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle dépense
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
                <p className="text-sm text-muted-foreground">Total dépenses</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMontant(stats.montant_total)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-primary" />
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
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Par statut</p>
                <div className="flex gap-1 mt-1">
                  {Object.entries(stats.par_statut).map(([statut, data]) => (
                    <Badge key={statut} variant="outline" className="text-xs">
                      {data.count}
                    </Badge>
                  ))}
                </div>
              </div>
              <Folder className="h-8 w-8 text-purple-500" />
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
                    placeholder="Rechercher par référence, libellé ou bénéficiaire..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                      checked={selectedIds.length === depenses.data.length && depenses.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depenses.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune dépense trouvée</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  depenses.data.map((depense) => (
                    <TableRow key={depense.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(depense.id)}
                          onCheckedChange={(checked) => handleSelectDepense(depense.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">{depense.reference}</div>
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
                        {depense.budget ? (
                          <div className="text-sm">{depense.budget.nom_complet}</div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {depense.categorie ? (
                          <div className="text-sm">{depense.categorie.nom_categorie}</div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMontant(depense.montant)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{depense.beneficiaire}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(depense.date_depense)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(depense.statut)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/depenses/${depense.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/depenses/${depense.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(depense)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {depenses.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={depenses.current_page}
                totalPages={depenses.last_page}
                onPageChange={(page) => {
                  router.get('/depenses', { ...filters, page }, {
                    preserveState: true,
                    replace: true,
                  });
                }}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}