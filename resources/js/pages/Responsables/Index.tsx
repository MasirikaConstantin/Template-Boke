import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  Users,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  UserPlus,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Responsable {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  type_responsable: string;
  telephone_1: string;
  email: string | null;
  profession: string | null;
  adresse: string | null;
  ref: string;
  sexe: 'M' | 'F';
  eleves_count: number;
  created_at: string;
  eleves: Array<{
    id: number;
    nom_complet: string;
    classe?: {
      nom_classe: string;
    };
  }>;
}

interface ResponsablesPageProps {
  responsables: {
    data: Responsable[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    type_responsable: string;
    est_actif: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    avec_eleves: number;
    pere: number;
    mere: number;
    tuteur: number;
  };
  typesResponsable: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ResponsablesIndex({
  responsables,
  filters,
  stats,
  typesResponsable,
  flash,
}: ResponsablesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/responsables', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/responsables', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(responsables.data.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectResponsable = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedIds.length} responsable(s) ?`)) {
      router.post('/responsables/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (responsable: Responsable) => {
    if (responsable.eleves_count > 0) {
      alert('Impossible de supprimer ce responsable car il est associé à des élèves.');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${responsable.nom_complet}" ?`)) {
      router.delete(`/responsables/${responsable.id}`);
    }
  };

  const getTypeResponsableLabel = (type: string) => {
    switch (type) {
      case 'pere': return 'Père';
      case 'mere': return 'Mère';
      case 'tuteur': return 'Tuteur';
      default: return 'Autre';
    }
  };

  const getTypeResponsableIcon = (type: string) => {
    switch (type) {
      case 'pere': return '👨';
      case 'mere': return '👩';
      case 'tuteur': return '👤';
      default: return '👥';
    }
  };

  const getSexeBadge = (sexe: string) => {
    if (sexe === 'M') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">👨 Masculin</Badge>;
    }
    return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">👩 Féminin</Badge>;
  };

  return (
    <>
      <Head title="Gestion des responsables" />
      
      <DashboardLayout activeRoute="/responsables">
        <PageHeader
          title="Responsables légaux"
          description={`${responsables.total} responsable(s) - ${stats.avec_eleves} avec élèves`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Responsables', href: '/responsables' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
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
              <Link href="/responsables/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau responsable
                </Button>
              </Link>
            </div>
          }
        />

        {flash?.success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avec élèves</p>
                <p className="text-2xl font-bold">{stats.avec_eleves}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pères</p>
                <p className="text-2xl font-bold">{stats.pere}</p>
              </div>
              <span className="text-2xl">👨</span>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mères</p>
                <p className="text-2xl font-bold">{stats.mere}</p>
              </div>
              <span className="text-2xl">👩</span>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tuteurs</p>
                <p className="text-2xl font-bold">{stats.tuteur}</p>
              </div>
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, téléphone, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.type_responsable || 'all'}
                onValueChange={(value) => handleFilterChange('type_responsable', value)}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typesResponsable).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.est_actif || 'all'}
                onValueChange={(value) => handleFilterChange('est_actif', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">Avec élèves</SelectItem>
                  <SelectItem value="false">Sans élèves</SelectItem>
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
                      checked={selectedIds.length === responsables.data.length && responsables.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Élèves</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responsables.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucun responsable trouvé</p>
                      <p className="text-sm mt-2">
                        <Link href="/responsables/create" className="text-primary hover:underline">
                          Créer votre premier responsable
                        </Link>
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  responsables.data.map((responsable) => (
                    <TableRow key={responsable.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(responsable.id)}
                          onCheckedChange={(checked) => handleSelectResponsable(responsable.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{responsable.nom_complet}</div>
                          
                          {responsable.profession && (
                            <div className="text-xs">
                              {responsable.profession}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <span className="text-sm">{getTypeResponsableIcon(responsable.type_responsable)}</span>
                          {getTypeResponsableLabel(responsable.type_responsable)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {responsable.telephone_1}
                          </div>
                          {responsable.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{responsable.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{responsable.eleves_count} élève(s)</span>
                          </div>
                          
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSexeBadge(responsable.sexe)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/responsables/${responsable.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/responsables/${responsable.id}/eleves`}>
                              <DropdownMenuItem>
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Gérer élèves
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/responsables/${responsable.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(responsable)}
                              className="text-destructive"
                              disabled={responsable.eleves_count > 0}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                              {responsable.eleves_count > 0 && (
                                <span className="text-xs ml-2">(avec élèves)</span>
                              )}
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

          {responsables.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={responsables.current_page}
                totalPages={responsables.last_page}
                onPageChange={(page) => {
                  router.get('/responsables', { ...filters, page }, {
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