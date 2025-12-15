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
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Professeur {
  id: number;
  nom: string;
  email: string;
}

interface Presence {
  id: number;
  ref: string;
  professeur_id: number;
  date: string;
  heure_arrivee: string | null;
  heure_depart: string | null;
  heures_prestées: number;
  statut: 'absent' | 'present' | 'complete';
  statut_label: string;
  statut_color: string;
  formatted_date: string;
  formatted_heures: string | null;
  retard_minutes: number | null;
  is_retard: boolean;
  is_absent: boolean;
  is_present: boolean;
  created_at: string;
  updated_at: string;
  professeur: Professeur;
}

interface PresencesPageProps {
  auth: any;
  presences: {
    data: Presence[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    professeur_id: string;
    date_debut: string;
    date_fin: string;
    statut: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  stats: {
    total: number;
    present: number;
    absent: number;
    total_heures: number;
  };
  professeurs: Professeur[];
  dates: Array<{
    value: string;
    label: string;
  }>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function PresencesIndex({
  auth,
  presences,
  filters,
  stats,
  professeurs,
  dates,
  flash,
}: PresencesPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search || '');
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    filters.date_debut ? new Date(filters.date_debut) : undefined
  );
  const [dateFin, setDateFin] = useState<Date | undefined>(
    filters.date_fin ? new Date(filters.date_fin) : undefined
  );

  // Gestion de la recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/presences', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Gestion des dates
  useEffect(() => {
    if (dateDebut && dateFin) {
      const timer = setTimeout(() => {
        router.get('/presences', { 
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
    router.get('/presences', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(presences.data.map(item => item.id));
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
      router.post('/presences/bulk-action', {
        ids: selectedIds,
        action,
      }, {
        onSuccess: () => setSelectedIds([]),
      });
    }
  };

  const handleDelete = (item: Presence) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la présence du ${item.formatted_date} ?`)) {
      router.delete(`/presences/${item.id}`);
    }
  };

  const getStatutBadge = (presence: Presence) => {
    const variants = {
      absent: { variant: 'destructive' as const, icon: XCircle },
      present: { variant: 'warning' as const, icon: Clock },
      complete: { variant: 'default' as const, icon: CheckCircle },
    };

    const { variant, icon: Icon } = variants[presence.statut] || { variant: 'outline' as const, icon: AlertCircle };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {presence.statut_label}
      </Badge>
    );
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatHeures = (heures: number) => {
    return `${heures.toFixed(2)}h`;
  };

  const handleMarquerPresence = (professeurId: number, type: 'arrivee' | 'depart') => {
    if (confirm(`Marquer ${type === 'arrivee' ? "l'arrivée" : 'le départ'} ?`)) {
      router.post('/presences/marquer', {
        professeur_id: professeurId,
        type,
      }, {
        onSuccess: () => {
          // Recharger la page
          router.reload();
        }
      });
    }
  };
  return (
    <>
      <Head title="Gestion des présences" />
      
      <DashboardLayout activeRoute="/professeurs">
        <PageHeader
          title="Présences"
          description={`${presences.total} enregistrements - ${stats.total_heures.toFixed(2)}h total`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Professeurs', href: '/professeurs' },
            { label: 'Présences', href: '/presences' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Actions ({selectedIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('mark_present')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer comme présent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('mark_absent')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Marquer comme absent
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
              <Link href="/presences/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle présence
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
                <p className="text-sm text-muted-foreground">Total enregistrements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Présences</p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absences</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures totales</p>
                <p className="text-2xl font-bold">{stats.total_heures.toFixed(2)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
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
                  <SelectItem value="present">Présent</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="complete">Journée complète</SelectItem>
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
                value={filters.per_page?.toString() || '20'}
                onValueChange={(value) => handleFilterChange('per_page', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Par page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
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
                      checked={selectedIds.length === presences.data.length && presences.data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Professeur</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presences.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune présence trouvée</p>
                      <p className="text-sm mt-2">
                        {filters.search ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par enregistrer une présence'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  presences.data.map((presence) => (
                    <TableRow key={presence.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(presence.id)}
                          onCheckedChange={(checked) => handleSelectItem(presence.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{presence.formatted_date}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(presence.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {presence.professeur.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{presence.professeur.nom}</div>
                            <div className="text-xs text-muted-foreground">
                              {presence.professeur.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatTime(presence.heure_arrivee)}
                              {presence.heure_depart && ` → ${formatTime(presence.heure_depart)}`}
                            </span>
                          </div>
                          {presence.heures_prestées > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Total: {formatHeures(presence.heures_prestées)}
                            </div>
                          )}
                          {presence.is_retard && presence.retard_minutes && (
                            <Badge variant="outline" className="text-xs">
                              Retard: {presence.retard_minutes} min
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatutBadge(presence)}
                      </TableCell>
                      <TableCell>
                        {presence.statut === 'complete' && (
                          <div className="text-xs text-green-600">
                            Journée complète
                          </div>
                        )}
                        {presence.statut === 'present' && !presence.heure_depart && (
                          <div className="text-xs text-amber-600">
                            En cours
                          </div>
                        )}
                        {presence.statut === 'absent' && (
                          <div className="text-xs text-red-600">
                            Non présenté
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/presences/${presence.id}`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/presences/${presence.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </Link>
                            {!presence.heure_arrivee && (
                              <DropdownMenuItem
                                onClick={() => handleMarquerPresence(presence.professeur_id, 'arrivee')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer arrivée
                              </DropdownMenuItem>
                            )}
                            {presence.heure_arrivee && !presence.heure_depart && (
                              <DropdownMenuItem
                                onClick={() => handleMarquerPresence(presence.professeur_id, 'depart')}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Marquer départ
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(presence)}
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
          {presences.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={presences.current_page}
                totalPages={presences.last_page}
                onPageChange={(page) => {
                  router.get('/presences', { ...filters, page }, {
                    preserveState: true,
                    replace: true,
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Actions rapides pour aujourd'hui */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Marquage rapide - Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professeurs.slice(0, 6).map((professeur) => {
                const presenceToday = presences.data.find(
                  p => p.professeur_id === professeur.id && 
                  new Date(p.date).toDateString() === new Date().toDateString()
                );

                return (
                  <div key={professeur.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {professeur.nom.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{professeur.nom}</div>
                          <div className="text-xs text-muted-foreground">
                            {presenceToday ? presenceToday.statut_label : 'Non enregistré'}
                          </div>
                        </div>
                      </div>
                      {presenceToday && getStatutBadge(presenceToday)}
                    </div>
                    <div className="flex gap-2">
                      {!presenceToday?.heure_arrivee ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMarquerPresence(professeur.id, 'arrivee')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Arrivée
                        </Button>
                      ) : null}
                      {presenceToday?.heure_arrivee && !presenceToday?.heure_depart ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMarquerPresence(professeur.id, 'depart')}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Départ
                        </Button>
                      ) : null}
                      <Link href={`/presences/create?professeur_id=${professeur.id}`}>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}