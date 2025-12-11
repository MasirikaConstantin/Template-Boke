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
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface ConfigurationFrais {
  id: number;
  annee_scolaire: string;
  nom_frais: string;
  montant_total: number;
  est_actif: boolean;
  ref: string;
  created_at: string;
  updated_at: string;
}

interface ConfigurationFraisPageProps {
  auth: any;
  frais: {
    data: ConfigurationFrais[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    annee_scolaire: string;
    est_actif: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    actifs: number;
    inactifs: number;
    montant_total: number;
  };
  annees: string[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ConfigurationFraisIndex({
  auth,
  frais,
  filters,
  stats,
  annees,
  flash,
}: ConfigurationFraisPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/configuration-frais', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/configuration-frais', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(frais.data.map(frai => frai.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectFrais = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedIds.length} configuration(s) ?`)) {
      router.post('/configuration-frais/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (frai: ConfigurationFrais) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${frai.nom_frais}" ?`)) {
      router.delete(`/configuration-frais/${frai.id}`);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  return (
    <>
      <Head title="Configuration des frais" />
      
      <DashboardLayout activeRoute="/configuration-frais">
        <PageHeader
          title="Configuration des frais"
          description={`${frais.total} configurations - Total: ${formatMontant(stats.montant_total)}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Configuration frais', href: '/configuration-frais' },
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
                    <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Désactiver
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
              <Link href="/configuration-frais/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle configuration
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
                <p className="text-sm text-muted-foreground">Total configurations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{stats.actifs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold">{stats.inactifs}</p>
              </div>
              <XCircle className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold">{formatMontant(stats.montant_total)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou année..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.annee_scolaire || ''}
                onValueChange={(value) => handleFilterChange('annee_scolaire', value)}
              >
                <SelectTrigger className="w-[160px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Année scolaire" />
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
                value={filters.est_actif || ''}
                onValueChange={(value) => handleFilterChange('est_actif', value)}
              >
                <SelectTrigger className="w-[140px]">
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
                value={filters.per_page?.toString() || '10'}
                onValueChange={(value) => handleFilterChange('per_page', value)}
              >
                <SelectTrigger className="w-[100px]">
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

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === frais.data.length && frais.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nom du frais</TableHead>
                  <TableHead>Année scolaire</TableHead>
                  <TableHead>Montant total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frais.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune configuration trouvée</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  frais.data.map((frai) => (
                    <TableRow key={frai.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(frai.id)}
                          onCheckedChange={(checked) => handleSelectFrais(frai.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{frai.nom_frais}</div>
                          <div className="text-xs text-muted-foreground">
                            Réf: {frai.ref}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {frai.annee_scolaire}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMontant(frai.montant_total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={frai.est_actif ? "default" : "secondary"}>
                          {frai.est_actif ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactif
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(frai.created_at).toLocaleDateString('fr-FR')}
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
                            <Link href={`/configuration-frais/${frai.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/configuration-frais/${frai.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(frai)}
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

          {frais.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={frais.current_page}
                totalPages={frais.last_page}
                onPageChange={(page) => {
                  router.get('/configuration-frais', { ...filters, page }, {
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