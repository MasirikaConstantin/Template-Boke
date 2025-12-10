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
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  CalendarClock,
  FileText,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Tranche {
  id: number;
  configuration_frai_id: number;
  nom_tranche: string;
  montant: number;
  date_limite: string;
  ordre: number;
  ref: string;
  created_at: string;
  updated_at: string;
  configuration_frais?: {
    id: number;
    nom_frais: string;
    annee_scolaire: string;
    est_actif: boolean;
  };
}

interface ConfigurationFrais {
  id: number;
  nom_frais: string;
  annee_scolaire: string;
}

interface TranchesPageProps {
  auth: any;
  tranches: {
    data: Tranche[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    configuration_frai_id: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    montant_total: number;
    prochaines_echeances: number;
  };
  configurations: ConfigurationFrais[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function TranchesIndex({
  auth,
  tranches,
  filters,
  stats,
  configurations,
  flash,
}: TranchesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/tranches', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/tranches', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(tranches.data.map(tranche => tranche.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectTranche = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} tranche(s) ?`)) {
      router.post('/tranches/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (tranche: Tranche) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${tranche.nom_tranche}" ?`)) {
      router.delete(`/tranches/${tranche.id}`);
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

  const getDateStatus = (dateLimite: string) => {
    const today = new Date();
    const limite = new Date(dateLimite);
    const diffTime = limite.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Échue', variant: 'destructive' as const };
    } else if (diffDays <= 7) {
      return { label: 'Bientôt', variant: 'warning' as const };
    } else if (diffDays <= 30) {
      return { label: 'Proche', variant: 'default' as const };
    } else {
      return { label: 'Loin', variant: 'secondary' as const };
    }
  };

  return (
    <>
      <Head title="Gestion des tranches" />
      
      <DashboardLayout activeRoute="/tranches">
        <PageHeader
          title="Tranches"
          description={`${tranches.total} tranches - Total: ${formatMontant(stats.montant_total)}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Configuration frais', href: '/configuration-frais' },
            { label: 'Tranches', href: '/tranches' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ({selectedIds.length})
                </Button>
              )}
              <Link href="/tranches/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle tranche
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total tranches</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
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
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Échéances proches</p>
                <p className="text-2xl font-bold">{stats.prochaines_echeances}</p>
              </div>
              <CalendarClock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou configuration..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.configuration_frai_id || ''}
                onValueChange={(value) => handleFilterChange('configuration_frai_id', value)}
              >
                <SelectTrigger className="w-[220px]">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Configuration de frais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes configurations</SelectItem>
                  {configurations.map((config) => (
                    <SelectItem key={config.id} value={config.id.toString()}>
                      {config.nom_frais} ({config.annee_scolaire})
                    </SelectItem>
                  ))}
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
                      checked={selectedIds.length === tranches.data.length && tranches.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Tranche</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date limite</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tranches.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune tranche trouvée</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  tranches.data.map((tranche) => {
                    const dateStatus = getDateStatus(tranche.date_limite);
                    return (
                      <TableRow key={tranche.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(tranche.id)}
                            onCheckedChange={(checked) => handleSelectTranche(tranche.id, checked === true)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tranche.nom_tranche}</div>
                            <div className="text-xs text-muted-foreground">
                              Réf: {tranche.ref}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tranche.configuration_frais ? (
                            <div>
                              <div className="font-medium">{tranche.configuration_frais.nom_frais}</div>
                              <div className="text-xs text-muted-foreground">
                                {tranche.configuration_frais.annee_scolaire}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non assignée</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatMontant(tranche.montant)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(tranche.date_limite)}</span>
                            <Badge variant={dateStatus.variant} className="text-xs">
                              {dateStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{tranche.ordre}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/tranches/${tranche.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/tranches/${tranche.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(tranche)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {tranches.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={tranches.current_page}
                totalPages={tranches.last_page}
                onPageChange={(page) => {
                  router.get('/tranches', { ...filters, page }, {
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