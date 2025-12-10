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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  User,
  GraduationCap,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  date_naissance: string;
  age: number;
  sexe: 'M' | 'F';
  sexe_label: string;
  telephone: string | null;
  email: string | null;
  statut: string;
  statut_label: string;
  moyenne_generale: number | null;
  photo_url: string;
  classe: {
    id: number;
    nom_classe: string;
    niveau: string;
    section: string | null;
  };
  created_at: string;
}

interface ElevesPageProps {
  auth: any;
  eleves: {
    data: Eleve[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    classe_id: string;
    statut: string;
    sexe: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    actifs: number;
    garcons: number;
    filles: number;
    redoublants: number;
    par_classe: Record<string, number>;
  };
  classes: Array<{
    id: number;
    nom_classe: string;
    niveau: string;
  }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ElevesIndex({
  auth,
  eleves,
  filters,
  stats,
  classes,
  flash,
}: ElevesPageProps) {
  const { url } = usePage();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  // Gestion de la recherche avec délai
  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/eleves', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/eleves', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSort = (column: string) => {
    const direction = filters.sort_by === column && filters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get('/eleves', { ...filters, sort_by: column, sort_direction: direction }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(eleves.data.map(eleve => eleve.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectEleve = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleDelete = (eleve: Eleve) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'élève "${eleve.nom_complet}" ?`)) {
      router.delete(`/eleves/${eleve.id}`);
    }
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, 'success' | 'warning' | 'secondary' | 'destructive' | 'outline'> = {
      'actif': 'success',
      'inactif': 'warning',
      'transfere': 'secondary',
      'exclus': 'destructive',
      'diplome': 'outline',
    };

    return (
      <Badge variant={variants[statut] || 'outline'} className="text-xs">
        {eleves.data.find(e => e.id === eleves.data[0]?.id)?.statut_label || statut}
      </Badge>
    );
  };

  const getSexeIcon = (sexe: string) => {
    return sexe === 'M' ? '👦' : '👧';
  };

  const getMoyenneColor = (moyenne: number | null) => {
    if (!moyenne) return 'text-muted-foreground';
    if (moyenne >= 15) return 'text-green-600 font-bold';
    if (moyenne >= 10) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <>
      <Head title="Gestion des élèves" />
      
      <DashboardLayout activeRoute="/eleves">
        <PageHeader
          title="Élèves"
          description={`${eleves.total} élèves inscrits`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Élèves', href: '/eleves' },
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
                    <DropdownMenuItem>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activer
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserX className="h-4 w-4 mr-2" />
                      Désactiver
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button 
                variant="outline" 
                onClick={() => window.open('/eleves/export', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Link href="/eleves/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel élève
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
                <p className="text-sm text-muted-foreground">Total élèves</p>
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
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Garçons</p>
                <p className="text-2xl font-bold">{stats.garcons}</p>
              </div>
              <span className="text-2xl">👦</span>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Filles</p>
                <p className="text-2xl font-bold">{stats.filles}</p>
              </div>
              <span className="text-2xl">👧</span>
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
                  placeholder="Rechercher un élève..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtres supplémentaires */}
            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.classe_id || ''}
                onValueChange={(value) => handleFilterChange('classe_id', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Toutes classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes classes</SelectItem>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id.toString()}>
                      {classe.nom_classe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.statut || ''}
                onValueChange={(value) => handleFilterChange('statut', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="transfere">Transféré</SelectItem>
                  <SelectItem value="exclus">Exclus</SelectItem>
                  <SelectItem value="diplome">Diplômé</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sexe || ''}
                onValueChange={(value) => handleFilterChange('sexe', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="M">Garçons</SelectItem>
                  <SelectItem value="F">Filles</SelectItem>
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
                  <SelectItem value="15">15</SelectItem>
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
                      checked={selectedIds.length === eleves.data.length && eleves.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('nom')}
                      className="font-semibold p-0 h-auto"
                    >
                      Élève
                      {filters.sort_by === 'nom' && (
                        <span className="ml-1">{filters.sort_direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('moyenne_generale')}
                      className="font-semibold p-0 h-auto"
                    >
                      Moyenne
                      {filters.sort_by === 'moyenne_generale' && (
                        <span className="ml-1">{filters.sort_direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eleves.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucun élève trouvé</p>
                      <p className="text-sm mt-2">
                        {filters.search ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par inscrire un nouvel élève'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  eleves.data.map((eleve) => (
                    <TableRow key={eleve.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(eleve.id)}
                          onCheckedChange={(checked) => handleSelectEleve(eleve.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={eleve.photo_url} alt={eleve.nom_complet} />
                            <AvatarFallback className={eleve.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                              {eleve.nom.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{eleve.nom_complet}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(eleve.date_naissance).toLocaleDateString('fr-FR')}
                              </span>
                              <span>({eleve.age} ans)</span>
                              <span>{getSexeIcon(eleve.sexe)}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{eleve.matricule}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{eleve.classe.nom_classe}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {eleve.classe.niveau}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {eleve.telephone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {eleve.telephone}
                            </div>
                          )}
                          {eleve.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{eleve.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {eleve.moyenne_generale ? (
                          <div className="flex items-center gap-2">
                            <div className={`text-lg font-bold ${getMoyenneColor(eleve.moyenne_generale)}`}>
                              {eleve.moyenne_generale.toFixed(2)}
                            </div>
                            {eleve.moyenne_generale >= 15 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(eleve.statut)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/eleves/${eleve.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/eleves/${eleve.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/eleves/${eleve.id}/bulletin`}>
                              <DropdownMenuItem>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Bulletin
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(eleve)}
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
          {eleves.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={eleves.current_page}
                totalPages={eleves.last_page}
                onPageChange={(page) => {
                  router.get('/eleves', { ...filters, page }, {
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