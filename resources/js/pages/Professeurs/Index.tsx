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
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Paperclip,
  AlarmCheck,
  DollarSign,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import profSalaires from '@/routes/prof-salaires';
import presences from '@/routes/presences';
import avanceSalaires from '@/routes/avance-salaires';
import paiementSalaires from '@/routes/paiement-salaires';

interface Professeur {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string | null;
  telephone: string | null;
  statut: string;
  type_contrat: string;
  niveau_etude: string;
  date_embauche: string;
  salaire_base: number | null;
  classe: {
    id: number;
    nom_classe: string;
  } | null;
  classes_count: number;
  created_at: string;
}

interface ProfesseurIndexPageProps {
  professeurs: {
    data: Professeur[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    statut: string;
    type_contrat: string;
    niveau_etude: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    actifs: number;
    suspendus: number;
    inactifs: number;
    professeurs_principaux: number;
  };
  statuts: Record<string, string>;
  typesContrat: Record<string, string>;
  niveauxEtude: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ProfesseurIndex({
  professeurs,
  filters,
  stats,
  statuts,
  typesContrat,
  niveauxEtude,
  flash,
}: ProfesseurIndexPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/professeurs', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/professeurs', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(professeurs.data.map(prof => prof.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProfesseur = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    const actions: Record<string, { message: string; confirm: string }> = {
      activate: {
        message: `Activer ${selectedIds.length} professeur(s) ?`,
        confirm: 'Activer',
      },
      suspend: {
        message: `Suspendre ${selectedIds.length} professeur(s) ?`,
        confirm: 'Suspendre',
      },
      delete: {
        message: `Supprimer ${selectedIds.length} professeur(s) ? Cette action est irréversible.`,
        confirm: 'Supprimer',
      },
    };

    if (confirm(actions[action].message)) {
      router.post('/professeurs/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (professeur: Professeur) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${professeur.nom_complet}" ?`)) {
      router.delete(`/professeurs/${professeur.id}`);
    }
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'outline'> = {
      'actif': 'success',
      'suspendu': 'warning',
      'inactif': 'secondary',
      'retraite': 'outline',
    };

    const icons: Record<string, React.ReactNode> = {
      'actif': <CheckCircle className="h-3 w-3 mr-1" />,
      'suspendu': <UserX className="h-3 w-3 mr-1" />,
      'inactif': <UserX className="h-3 w-3 mr-1" />,
      'retraite': <UserCheck className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[statut] || 'outline'} className="flex items-center">
        {icons[statut]}
        {statuts[statut] || statut}
      </Badge>
    );
  };

  const getContratBadge = (contrat: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'cdi': 'default',
      'cdd': 'secondary',
      'vacataire': 'outline',
      'stagiare': 'outline',
    };

    return (
      <Badge variant={variants[contrat] || 'outline'}>
        {typesContrat[contrat] || contrat}
      </Badge>
    );
  };

  const getNiveauEtudeBadge = (niveau: string) => {
    const colors: Record<string, string> = {
      'doctorat': 'bg-purple-100 text-purple-800',
      'master': 'bg-blue-100 text-blue-800',
      'licence': 'bg-green-100 text-green-800',
      'autre': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>
        {niveauxEtude[niveau] || niveau}
      </span>
    );
  };

  const formatSalaire = (salaire: number | null) => {
    if (!salaire) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(salaire).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <Head title="Gestion des professeurs" />
      
      <DashboardLayout activeRoute="/professeurs">
        <PageHeader
          title="Gestion des professeurs"
          description={`${professeurs.total} professeur(s) - ${stats.actifs} actif(s)`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Professeurs', href: '/professeurs' },
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
                    <DropdownMenuItem onClick={() => handleBulkAction('suspend')}>
                      <UserX className="h-4 w-4 mr-2" />
                      Suspendre
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
              <Link href={presences.index().url}>
                <Button>
                  <AlarmCheck className="h-4 w-4 mr-2" />
                  Présences
                </Button>
              </Link>
              <Link href={paiementSalaires.index().url}>
                <Button>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Paiment Salaire
                </Button>
              </Link>
              <Link href={avanceSalaires.index().url}>
                <Button>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Avance Salaire
                </Button>
              </Link>
              <Link href={profSalaires.index().url}>
                <Button>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Configurations
                </Button>
              </Link>
              <Link href="/professeurs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau professeur
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total professeurs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
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
                <p className="text-sm text-muted-foreground">Suspendus</p>
                <p className="text-2xl font-bold">{stats.suspendus}</p>
              </div>
              <UserX className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Professeurs principaux</p>
                <p className="text-2xl font-bold">{stats.professeurs_principaux}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom, matricule..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.statut || ''}
                onValueChange={(value) => handleFilterChange('statut', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  {Object.entries(statuts).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type_contrat || ''}
                onValueChange={(value) => handleFilterChange('type_contrat', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous contrats</SelectItem>
                  {Object.entries(typesContrat).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.niveau_etude || ''}
                onValueChange={(value) => handleFilterChange('niveau_etude', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  {Object.entries(niveauxEtude).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === professeurs.data.length && professeurs.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Contrat</TableHead>
                  <TableHead>Classe principale</TableHead>
                  <TableHead>Salaire</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professeurs.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucun professeur trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  professeurs.data.map((professeur) => (
                    <TableRow key={professeur.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(professeur.id)}
                          onCheckedChange={(checked) => handleSelectProfesseur(professeur.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{professeur.nom_complet}</div>
                          <div className="text-xs text-muted-foreground">
                            {professeur.matricule}
                            {professeur.classes_count > 0 && (
                              <span className="ml-2">
                                • {professeur.classes_count} classe(s)
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            {getNiveauEtudeBadge(professeur.niveau_etude)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {professeur.telephone && (
                            <div className="text-sm">{professeur.telephone}</div>
                          )}
                          {professeur.email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {professeur.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(professeur.statut)}
                      </TableCell>
                      <TableCell>
                        {getContratBadge(professeur.type_contrat)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(professeur.date_embauche)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {professeur.classe ? (
                          <Badge variant="outline">
                            {professeur.classe.nom_classe}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatSalaire(professeur.salaire_base)}
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
                            <Link href={`/professeurs/${professeur.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/professeurs/${professeur.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <Link href={`/professeurs/${professeur.id}/affectation`}>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Affectations
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(professeur)}
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

          {professeurs.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={professeurs.current_page}
                totalPages={professeurs.last_page}
                onPageChange={(page) => {
                  router.get('/professeurs', { ...filters, page }, {
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