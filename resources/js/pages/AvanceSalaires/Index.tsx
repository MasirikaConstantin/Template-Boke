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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  AlertCircle,
  TrendingUp,
  CalendarIcon,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { index } from '@/routes/professeurs';

interface Professeur {
  id: number;
  name: string;
  email: string;
}

interface AvanceSalaire {
  id: number;
  ref: string;
  professeur_id: number;
  montant: number;
  date_avance: string;
  statut: 'demandee' | 'approuvee' | 'payee' | 'deduite';
  statut_label: string;
  statut_color: string;
  formatted_montant: string;
  formatted_date: string;
  raison_rejet?: string;
  approuve_par?: number;
  approuve_le?: string;
  created_at: string;
  updated_at: string;
  professeur: Professeur;
  approbateur?: {
    id: number;
    name: string;
  };
}

interface AvanceSalairesPageProps {
  auth: any;
  avances: {
    data: AvanceSalaire[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    professeur_id: string;
    statut: string;
    date_debut: string;
    date_fin: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    demandee: number;
    approuvee: number;
    payee: number;
    deduite: number;
    total_montant: number;
  };
  professeurs: Professeur[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function AvanceSalairesIndex({
  auth,
  avances,
  filters,
  stats,
  professeurs,
  flash,
}: AvanceSalairesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    filters.date_debut ? new Date(filters.date_debut) : undefined
  );
  const [dateFin, setDateFin] = useState<Date | undefined>(
    filters.date_fin ? new Date(filters.date_fin) : undefined
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/avance-salaires', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (dateDebut && dateFin) {
      const timer = setTimeout(() => {
        router.get('/avance-salaires', { 
          ...filters, 
          date_debut: format(dateDebut, 'yyyy-MM-dd'),
          date_fin: format(dateFin, 'yyyy-MM-dd')
        }, {
          preserveState: true,
          replace: true,
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [dateDebut, dateFin]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/avance-salaires', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(avances.data.map(item => item.id));
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
      router.post('/avance-salaires/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (item: AvanceSalaire) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette avance de ${item.formatted_montant} ?`)) {
      router.delete(`/avance-salaires/${item.id}`);
    }
  };

  const handleApprouver = (item: AvanceSalaire) => {
    if (confirm(`Approuver l'avance de ${item.formatted_montant} ?`)) {
      router.post(`/avance-salaires/${item.id}/approuver`, {}, {
        onSuccess: () => router.reload(),
      });
    }
  };

  const handlePayer = (item: AvanceSalaire) => {
    if (confirm(`Marquer comme payée l'avance de ${item.formatted_montant} ?`)) {
      router.post(`/avance-salaires/${item.id}/payer`, {}, {
        onSuccess: () => router.reload(),
      });
    }
  };

  const getStatutBadge = (avance: AvanceSalaire) => {
    const variants = {
      demandee: { variant: 'warning' as const, icon: Clock },
      approuvee: { variant: 'info' as const, icon: CheckCircle },
      payee: { variant: 'success' as const, icon: DollarSign },
      deduite: { variant: 'secondary' as const, icon: CreditCard },
    };

    const { variant, icon: Icon } = variants[avance.statut] || { variant: 'outline' as const, icon: AlertCircle };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {avance.statut_label}
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
      <Head title="Gestion des avances sur salaires" />
      
      <DashboardLayout activeRoute="/depenses">
        <PageHeader
          title="Avances sur salaires"
          description={`${avances.total} avances - ${formatCurrency(stats.total_montant)} total`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Professeurs', href: index().url },
            { label: 'Avances', href: '/avance-salaires' },
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
                    <DropdownMenuItem onClick={() => handleBulkAction('approuver')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('payer')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Marquer comme payée
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
              <Link href="/avance-salaires/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle avance
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total avances</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demandées</p>
                <p className="text-2xl font-bold">{stats.demandee}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold">{stats.approuvee}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold">{stats.payee}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total montant</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_montant)}</p>
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
                value={filters.statut || ''}
                onValueChange={(value) => handleFilterChange('statut', value)}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="demandee">Demandée</SelectItem>
                  <SelectItem value="approuvee">Approuvée</SelectItem>
                  <SelectItem value="payee">Payée</SelectItem>
                  <SelectItem value="deduite">Déduite</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateDebut ? format(dateDebut, 'dd/MM/yyyy') : 'Début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateDebut}
                    onSelect={setDateDebut}
                    locale={fr}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFin ? format(dateFin, 'dd/MM/yyyy') : 'Fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={setDateFin}
                    locale={fr}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>

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
                      checked={selectedIds.length === avances.data.length && avances.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avances.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune avance trouvée</p>
                      <p className="text-sm mt-2">
                        {filters.search ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer une nouvelle avance'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  avances.data.map((avance) => (
                    <TableRow key={avance.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(avance.id)}
                          onCheckedChange={(checked) => handleSelectItem(avance.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{avance.formatted_date}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(avance.date_avance).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {avance.professeur.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{avance.professeur.nom}</div>
                            <div className="text-xs text-muted-foreground">
                              {avance.professeur.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-lg">
                          {avance.formatted_montant}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(avance)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/avance-salaires/${avance.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/avance-salaires/${avance.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            {avance.statut === 'demandee' && (
                              <DropdownMenuItem onClick={() => handleApprouver(avance)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                            )}
                            {avance.statut === 'approuvee' && (
                              <DropdownMenuItem onClick={() => handlePayer(avance)}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Marquer comme payée
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(avance)}
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
          {avances.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={avances.current_page}
                totalPages={avances.last_page}
                onPageChange={(page) => {
                  router.get('/avance-salaires', { ...filters, page }, {
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