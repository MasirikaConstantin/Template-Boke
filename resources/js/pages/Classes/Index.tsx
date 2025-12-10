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
import { Progress } from '@/components/ui/progress';
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
  School,
  BookOpen,
  TrendingUp,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Classe {
  id: number;
  nom_classe: string;
  nom_complet: string;
  niveau: 'primaire' | 'secondaire';
  niveau_label: string;
  section: string | null;
  ref: string;
  professeur_principal: {
    id: number;
    name: string;
    email: string;
  } | null;
  capacite_max: number;
  nombre_eleves: number;
  pourcentage_occupation: number;
  is_full: boolean;
  statut: 'active' | 'inactive' | 'archived';
  statut_label: string;
  statut_color: string;
  description: string | null;
  created_at: string;
}

interface ClassesPageProps {
  auth: any;
  classes: {
    data: Classe[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    niveau: string;
    section: string;
    statut: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    primaire: number;
    secondaire: number;
    active: number;
    total_eleves: number;
  };
  sections: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ClassesIndex({
  auth,
  classes,
  filters,
  stats,
  sections,
  flash,
}: ClassesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');

  // Gestion de la recherche avec délai
  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/classes', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/classes', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(classes.data.map(classe => classe.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectClasse = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (confirm(`Êtes-vous sûr de vouloir effectuer cette action sur ${selectedIds.length} classe(s) ?`)) {
      router.post('/classes/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (classe: Classe) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classe.nom_complet}" ?`)) {
      router.delete(`/classes/${classe.id}`);
    }
  };

  const getStatutBadge = (classe: Classe) => {
    const variants: Record<string, 'default' | 'warning' | 'secondary' | 'outline'> = {
      active: 'default',
      inactive: 'warning',
      archived: 'secondary',
    };

    return (
      <Badge variant={variants[classe.statut] || 'outline'}>
        {classe.statut_label}
      </Badge>
    );
  };

  const getNiveauBadge = (niveau: string) => {
    return (
      <Badge variant={niveau === 'primaire' ? 'default' : 'secondary'}>
        {niveau === 'primaire' ? 'Primaire' : 'Secondaire'}
      </Badge>
    );
  };

  return (
    <>
      <Head title="Gestion des classes" />
      
      <DashboardLayout activeRoute="/classes">
        <PageHeader
          title="Classes"
          description={`${classes.total} classes - ${stats.total_eleves} élèves`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/classes' },
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
                      Activer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                      Désactiver
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                      Archiver
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
              <Button 
                variant="outline" 
                onClick={() => window.open('/classes/export', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Link href="/classes/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle classe
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
                <p className="text-sm text-muted-foreground">Total classes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <School className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Primaire</p>
                <p className="text-2xl font-bold">{stats.primaire}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Secondaire</p>
                <p className="text-2xl font-bold">{stats.secondaire}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Élèves total</p>
                <p className="text-2xl font-bold">{stats.total_eleves}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
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
                  placeholder="Rechercher une classe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtres supplémentaires */}
            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.niveau || ''}
                onValueChange={(value) => handleFilterChange('niveau', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="primaire">Primaire</SelectItem>
                  <SelectItem value="secondaire">Secondaire</SelectItem>
                </SelectContent>
              </Select>

              {filters.niveau === 'secondaire' && (
                <Select
                  value={filters.section || ''}
                  onValueChange={(value) => handleFilterChange('section', value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes sections</SelectItem>
                    {Object.entries(sections).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={filters.statut || ''}
                onValueChange={(value) => handleFilterChange('statut', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
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
                      checked={selectedIds.length === classes.data.length && classes.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Niveau/Section</TableHead>
                  <TableHead>Prof. Principal</TableHead>
                  <TableHead>Élèves</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <School className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune classe trouvée</p>
                      <p className="text-sm mt-2">
                        {filters.search ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par créer une nouvelle classe'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.data.map((classe) => (
                    <TableRow key={classe.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(classe.id)}
                          onCheckedChange={(checked) => handleSelectClasse(classe.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{classe.nom_classe}</div>
                          <div className="text-xs text-muted-foreground">
                            Réf: {classe.ref}
                          </div>
                          {classe.description && (
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                              {classe.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getNiveauBadge(classe.niveau)}
                          {classe.section && (
                            <Badge variant="outline" className="text-xs">
                              {sections[classe.section] || classe.section}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {classe.professeur_principal ? (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {classe.professeur_principal.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{classe.professeur_principal.name}</p>
                              <p className="text-xs text-muted-foreground">{classe.professeur_principal.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {classe.nombre_eleves} / {classe.capacite_max}
                          </p>
                          {classe.is_full && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              Complet
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-48">
                        <div className="space-y-2">
                          <Progress value={classe.pourcentage_occupation} className="h-2" />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {classe.pourcentage_occupation}%
                            </span>
                            <span className={
                              classe.pourcentage_occupation > 90 
                                ? 'text-destructive' 
                                : classe.pourcentage_occupation > 70 
                                  ? 'text-amber-600' 
                                  : 'text-green-600'
                            }>
                              {classe.pourcentage_occupation > 90 
                                ? 'Surpeuplé' 
                                : classe.pourcentage_occupation > 70 
                                  ? 'Rempli' 
                                  : 'Normal'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(classe)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/classes/${classe.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/classes/${classe.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/classes/${classe.id}/rapport`}>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Rapport
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(classe)}
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
          {classes.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={classes.current_page}
                totalPages={classes.last_page}
                onPageChange={(page) => {
                  router.get('/classes', { ...filters, page }, {
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