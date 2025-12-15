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
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Professeur {
  id: number;
  nom: string;
  email: string;
}

interface ProfSalaire {
  id: number;
  ref: string;
  professeur_id: number;
  type_salaire: 'horaire' | 'mensuel';
  taux_horaire: number | null;
  salaire_fixe: number | null;
  montant: number;
  formatted_montant: string;
  type_salaire_label: string;
  created_at: string;
  updated_at: string;
  professeur: Professeur;
}

interface ProfSalairesPageProps {
  auth: any;
  profSalaires: {
    data: ProfSalaire[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    type_salaire: string;
    professeur_id: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    horaire: number;
    mensuel: number;
    total_montant: number;
  };
  professeurs: Professeur[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ProfSalairesIndex({
  auth,
  profSalaires,
  filters,
  stats,
  professeurs,
  flash,
}: ProfSalairesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  // Gestion de la recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/prof-salaires', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/prof-salaires', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(profSalaires.data.map(item => item.id));
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
      router.post('/prof-salaires/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (item: ProfSalaire) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le salaire de "${item.professeur.nom}" ?`)) {
      router.delete(`/prof-salaires/${item.id}`);
    }
  };

  const getTypeSalaireBadge = (type: string) => {
    const variants = {
      horaire: { label: 'Horaire', variant: 'default' as const, icon: Clock },
      mensuel: { label: 'Mensuel', variant: 'secondary' as const, icon: Calendar },
    };

    const { label, variant, icon: Icon } = variants[type as keyof typeof variants] || { label: type, variant: 'outline' as const, icon: DollarSign };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount).replace('$US', '$');
  };

  return (
    <>
      <Head title="Gestion des salaires des professeurs" />
      
      <DashboardLayout activeRoute="/professeurs">
        <PageHeader
          title="Salaires des professeurs"
          description={`${profSalaires.total} configurations - ${formatCurrency(stats.total_montant)} total`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Professeurs', href: '/professeurs' },
            { label: 'Salaires', href: '/prof-salaires' },
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
              <Link href="/prof-salaires/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau salaire
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
                <p className="text-sm text-muted-foreground">Total configurations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Salaire horaire</p>
                <p className="text-2xl font-bold">{stats.horaire}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Salaire mensuel</p>
                <p className="text-2xl font-bold">{stats.mensuel}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_montant)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.type_salaire || ''}
                onValueChange={(value) => handleFilterChange('type_salaire', value)}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type salaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="horaire">Horaire</SelectItem>
                  <SelectItem value="mensuel">Mensuel</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.professeur_id || ''}
                onValueChange={(value) => handleFilterChange('professeur_id', value)}
              >
                <SelectTrigger className="w-[180px]">
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

        {/* Tableau */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === profSalaires.data.length && profSalaires.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead>Type de salaire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profSalaires.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune configuration de salaire trouvée</p>
                      <p className="text-sm mt-2">
                        {filters.search ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer une nouvelle configuration'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  profSalaires.data.map((salaire) => (
                    <TableRow key={salaire.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(salaire.id)}
                          onCheckedChange={(checked) => handleSelectItem(salaire.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {salaire.professeur.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{salaire.professeur.nom}</div>
                            <div className="text-xs text-muted-foreground">
                              {salaire.professeur.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeSalaireBadge(salaire.type_salaire)}
                        {salaire.type_salaire === 'horaire' && salaire.taux_horaire && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Taux horaire
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-lg">
                          {salaire.formatted_montant}
                        </div>
                        {salaire.type_salaire === 'mensuel' && salaire.salaire_fixe && (
                          <p className="text-xs text-muted-foreground">
                            Par mois
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {salaire.ref}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(salaire.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(salaire.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                            <Link href={`/prof-salaires/${salaire.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/prof-salaires/${salaire.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(salaire)}
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
          {profSalaires.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={profSalaires.current_page}
                totalPages={profSalaires.last_page}
                onPageChange={(page) => {
                  router.get('/prof-salaires', { ...filters, page }, {
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