import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  CalendarDays,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  School,
  BarChart3,
  CalendarIcon,
  MoreVertical,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Percent,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { format, subDays, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  photo?: string;
  classe: {
    id: number;
    nom: string;
    niveau: string;
  };
  date_naissance: string;
  age: number;
  parent_contact: string;
  parent_email: string;
}

interface PresenceEleve {
  id: number;
  eleve_id: number;
  date: string;
  statut: 'present' | 'absent' | 'retard' | 'exclu' | 'malade';
  heure_arrivee?: string;
  heure_depart?: string;
  retard_minutes?: number;
  raison_absence?: string;
  justificatif?: boolean;
}

interface Classe {
  id: number;
  nom: string;
  niveau: string;
  effectif: number;
  professeur_principal: string;
}

interface Stats {
  total: number;
  presents: number;
  absents: number;
  retards: number;
  taux_presence: number;
  par_classe: Array<{
    classe: string;
    taux: number;
    presents: number;
    absents: number;
  }>;
}

// Données génériques
const generateEleves = (): Eleve[] => {
  const noms = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'];
  const prenoms = ['Lucas', 'Emma', 'Hugo', 'Chloé', 'Nathan', 'Léa', 'Tom', 'Manon', 'Louis', 'Julie'];
  const classes = [
    { id: 1, nom: '6ème A', niveau: 'Collège' },
    { id: 2, nom: '5ème B', niveau: 'Collège' },
    { id: 3, nom: '4ème C', niveau: 'Collège' },
    { id: 4, nom: '3ème D', niveau: 'Collège' },
    { id: 5, nom: 'Terminale S', niveau: 'Lycée' },
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    matricule: `ELEV${(i + 1000).toString().padStart(4, '0')}`,
    nom: noms[Math.floor(Math.random() * noms.length)],
    prenom: prenoms[Math.floor(Math.random() * prenoms.length)],
    photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    classe: classes[Math.floor(Math.random() * classes.length)],
    date_naissance: `200${Math.floor(Math.random() * 6) + 4}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    age: Math.floor(Math.random() * 6) + 12,
    parent_contact: `06${Math.floor(Math.random() * 90000000) + 10000000}`,
    parent_email: `parent${i}@example.com`,
  }));
};

const generatePresences = (eleves: Eleve[], date: Date): PresenceEleve[] => {
  const statuts: Array<PresenceEleve['statut']> = ['present', 'absent', 'retard', 'exclu', 'malade'];
  
  return eleves.map(eleve => {
    const statut = statuts[Math.floor(Math.random() * statuts.length)];
    const presence: PresenceEleve = {
      id: Math.floor(Math.random() * 10000),
      eleve_id: eleve.id,
      date: format(date, 'yyyy-MM-dd'),
      statut,
    };

    if (statut === 'present' || statut === 'retard') {
      presence.heure_arrivee = `0${Math.floor(Math.random() * 2) + 7}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      presence.heure_depart = `${Math.floor(Math.random() * 4) + 16}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      
      if (statut === 'retard') {
        presence.retard_minutes = Math.floor(Math.random() * 60) + 5;
      }
    }

    if (statut === 'absent') {
      presence.raison_absence = ['Maladie', 'Rendez-vous médical', 'Voyage', 'Autre'][Math.floor(Math.random() * 4)];
      presence.justificatif = Math.random() > 0.5;
    }

    return presence;
  });
};

const generateClasses = (): Classe[] => {
  return [
    { id: 1, nom: '6ème A', niveau: 'Collège', effectif: 28, professeur_principal: 'Mme. Dubois' },
    { id: 2, nom: '5ème B', niveau: 'Collège', effectif: 25, professeur_principal: 'M. Martin' },
    { id: 3, nom: '4ème C', niveau: 'Collège', effectif: 30, professeur_principal: 'Mme. Bernard' },
    { id: 4, nom: '3ème D', niveau: 'Collège', effectif: 27, professeur_principal: 'M. Thomas' },
    { id: 5, nom: 'Terminale S', niveau: 'Lycée', effectif: 32, professeur_principal: 'Mme. Robert' },
    { id: 6, nom: 'Première L', niveau: 'Lycée', effectif: 24, professeur_principal: 'M. Richard' },
    { id: 7, nom: 'Seconde Générale', niveau: 'Lycée', effectif: 35, professeur_principal: 'Mme. Petit' },
  ];
};

export default function PresencesElevesIndex() {
  // États
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [presences, setPresences] = useState<PresenceEleve[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    presents: 0,
    absents: 0,
    retards: 0,
    taux_presence: 0,
    par_classe: [],
  });
  const [selectedEleves, setSelectedEleves] = useState<number[]>([]);

  // Initialisation des données
  useEffect(() => {
    const elevesData = generateEleves();
    const presencesData = generatePresences(elevesData, selectedDate);
    const classesData = generateClasses();
    
    setEleves(elevesData);
    setPresences(presencesData);
    setClasses(classesData);
  }, [selectedDate]);

  // Calcul des statistiques
  useEffect(() => {
    if (presences.length === 0) return;

    const total = presences.length;
    const presents = presences.filter(p => p.statut === 'present').length;
    const absents = presences.filter(p => p.statut === 'absent').length;
    const retards = presences.filter(p => p.statut === 'retard').length;
    const taux_presence = (presents / total) * 100;

    // Statistiques par classe
    const parClasse = classes.map(classe => {
      const elevesClasse = eleves.filter(e => e.classe.nom === classe.nom);
      const presencesClasse = presences.filter(p => 
        elevesClasse.some(e => e.id === p.eleve_id)
      );
      
      const presentsClasse = presencesClasse.filter(p => p.statut === 'present').length;
      const absentsClasse = presencesClasse.filter(p => p.statut === 'absent').length;
      const taux = (presentsClasse / presencesClasse.length) * 100 || 0;

      return {
        classe: classe.nom,
        taux,
        presents: presentsClasse,
        absents: absentsClasse,
      };
    });

    setStats({
      total,
      presents,
      absents,
      retards,
      taux_presence,
      par_classe: parClasse,
    });
  }, [presences, eleves, classes]);

  // Filtrage des élèves
  const filteredEleves = eleves.filter(eleve => {
    const matchesSearch = searchTerm === '' || 
      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClasse = selectedClasse === 'all' || eleve.classe.nom === selectedClasse;
    
    if (selectedStatut === 'all') {
      return matchesSearch && matchesClasse;
    }
    
    const presence = presences.find(p => p.eleve_id === eleve.id);
    return matchesSearch && matchesClasse && presence?.statut === selectedStatut;
  });

  // Gestion des sélections
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEleves(filteredEleves.map(e => e.id));
    } else {
      setSelectedEleves([]);
    }
  };

  const handleSelectEleve = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedEleves([...selectedEleves, id]);
    } else {
      setSelectedEleves(selectedEleves.filter(eleveId => eleveId !== id));
    }
  };

  // Gestion des statuts
  const handleChangeStatut = (eleveId: number, statut: PresenceEleve['statut']) => {
    setPresences(prev => prev.map(p => 
      p.eleve_id === eleveId ? { ...p, statut } : p
    ));
  };

  const handleBulkChangeStatut = (statut: PresenceEleve['statut']) => {
    if (selectedEleves.length === 0) return;
    
    setPresences(prev => prev.map(p => 
      selectedEleves.includes(p.eleve_id) ? { ...p, statut } : p
    ));
    setSelectedEleves([]);
  };

  // Navigation dans le calendrier
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Fonctions utilitaires
  const getStatutBadge = (statut: PresenceEleve['statut']) => {
    const variants = {
      present: { variant: 'success' as const, icon: CheckCircle, label: 'Présent' },
      absent: { variant: 'destructive' as const, icon: XCircle, label: 'Absent' },
      retard: { variant: 'warning' as const, icon: Clock, label: 'Retard' },
      exclu: { variant: 'secondary' as const, icon: AlertCircle, label: 'Exclu' },
      malade: { variant: 'info' as const, icon: AlertCircle, label: 'Malade' },
    };

    const { variant, icon: Icon, label } = variants[statut];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getNiveauBadge = (niveau: string) => {
    const variants = {
      'Collège': 'default',
      'Lycée': 'secondary',
    };
    
    return (
      <Badge variant={variants[niveau as keyof typeof variants] as any}>
        {niveau}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <>
      <Head title="Gestion des présences des élèves" />
      
      <DashboardLayout activeRoute="/presences-eleves">
        <PageHeader
          title="Présences des élèves"
          description={`Suivi quotidien des présences - ${formatDate(selectedDate)}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Vie scolaire', href: '#' },
            { label: 'Présences', href: '/presences-eleves' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedEleves.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Actions ({selectedEleves.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkChangeStatut('present')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer comme présent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkChangeStatut('absent')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Marquer comme absent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkChangeStatut('retard')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Marquer comme retard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Notifier les parents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle absence
              </Button>
            </div>
          }
        />

        {/* Sélecteur de date */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-14">
              <div className="flex items-center gap-14">
                <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                  <CalendarDays className="h-4 w-4 rotate-180" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(selectedDate)}
                      {isToday && (
                        <Badge variant="outline" className="ml-2">
                          Aujourd'hui
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      locale={fr}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <CalendarDays className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" onClick={handleToday}>
                  Aujourd'hui
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {format(selectedDate, 'EEE', { locale: fr })}
                </Badge>
                <Badge variant="outline">
                  Semaine {Math.ceil(selectedDate.getDate() / 7)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total élèves</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <Progress value={100} className="h-2 mt-4" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Présents</p>
                  <p className="text-2xl font-bold">{stats.presents}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <Progress 
                value={stats.taux_presence} 
                className={`h-2 mt-4 ${
                  stats.taux_presence >= 90 ? 'bg-green-500' :
                  stats.taux_presence >= 80 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
              <div className="text-xs text-muted-foreground mt-2">
                {stats.taux_presence.toFixed(1)}% de présence
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absents</p>
                  <p className="text-2xl font-bold">{stats.absents}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <Progress 
                value={(stats.absents / stats.total) * 100} 
                className="h-2 mt-4 bg-red-500"
              />
              <div className="text-xs text-muted-foreground mt-2">
                {((stats.absents / stats.total) * 100).toFixed(1)}% d'absence
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Retards</p>
                  <p className="text-2xl font-bold">{stats.retards}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <Progress 
                value={(stats.retards / stats.total) * 100} 
                className="h-2 mt-4 bg-amber-500"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Retard moyen: {stats.retards > 0 ? '15 min' : '0 min'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtres et recherche */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un élève..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                      <SelectTrigger className="w-[180px]">
                        <School className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Toutes classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes classes</SelectItem>
                        {classes.map(classe => (
                          <SelectItem key={classe.id} value={classe.nom}>
                            {classe.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Tous statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="present">Présent</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="retard">Retard</SelectItem>
                        <SelectItem value="malade">Malade</SelectItem>
                        <SelectItem value="exclu">Exclu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {filteredEleves.length} élève{filteredEleves.length > 1 ? 's' : ''} trouvé{filteredEleves.length > 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Exporter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Notifier absents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des élèves */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des élèves</CardTitle>
                <CardDescription>
                  Cliquez sur les badges pour changer le statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedEleves.length === filteredEleves.length && filteredEleves.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Élève</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Horaires</TableHead>
                        <TableHead>Contact parent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEleves.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Aucun élève trouvé</p>
                            <p className="text-sm mt-2">
                              Modifiez vos critères de recherche
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEleves.map(eleve => {
                          const presence = presences.find(p => p.eleve_id === eleve.id);
                          
                          return (
                            <TableRow key={eleve.id} className="hover:bg-muted/50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedEleves.includes(eleve.id)}
                                  onCheckedChange={(checked) => handleSelectEleve(eleve.id, checked === true)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                    {eleve.photo ? (
                                      <img 
                                        src={eleve.photo} 
                                        alt={`${eleve.prenom} ${eleve.nom}`}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {eleve.prenom} {eleve.nom}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {eleve.matricule} • {eleve.age} ans
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{eleve.classe.nom}</div>
                                  {getNiveauBadge(eleve.classe.niveau)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <div className="cursor-pointer">
                                      {presence ? getStatutBadge(presence.statut) : getStatutBadge('absent')}
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem onClick={() => handleChangeStatut(eleve.id, 'present')}>
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Présent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatut(eleve.id, 'absent')}>
                                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                      Absent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatut(eleve.id, 'retard')}>
                                      <Clock className="h-4 w-4 mr-2 text-amber-600" />
                                      Retard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatut(eleve.id, 'malade')}>
                                      <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                                      Malade
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatut(eleve.id, 'exclu')}>
                                      <AlertCircle className="h-4 w-4 mr-2 text-gray-600" />
                                      Exclu
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                                {presence?.raison_absence && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {presence.raison_absence}
                                    {presence.justificatif && (
                                      <Badge variant="outline" className="ml-1 text-xs">
                                        Justifié
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {presence?.heure_arrivee ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      <Clock className="h-3 w-3" />
                                      {presence.heure_arrivee} - {presence.heure_depart || '--:--'}
                                    </div>
                                    {presence.retard_minutes && (
                                      <Badge variant="outline" className="text-xs">
                                        +{presence.retard_minutes} min
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Non applicable</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {eleve.parent_contact}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate max-w-[120px]">
                                      {eleve.parent_email}
                                    </span>
                                  </div>
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
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Voir profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Contacter parent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Justificatif
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      <AlertCircle className="h-4 w-4 mr-2" />
                                      Signaler problème
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedEleves.length} élève{selectedEleves.length > 1 ? 's' : ''} sélectionné{selectedEleves.length > 1 ? 's' : ''}
                </div>
                <Button variant="outline" onClick={() => setSelectedEleves([])}>
                  Tout désélectionner
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Statistiques par classe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Taux de présence par classe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.par_classe.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.classe}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.presents} présents / {item.presents + item.absents} élèves
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            item.taux >= 90 ? 'text-green-600' :
                            item.taux >= 80 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {item.taux.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.taux >= 90 ? 'Excellent' :
                             item.taux >= 80 ? 'Bon' : 'À améliorer'}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={item.taux} 
                        className={`h-2 ${
                          item.taux >= 90 ? 'bg-green-500' :
                          item.taux >= 80 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Graphique de présence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Évolution sur 7 jours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = subDays(new Date(), 6 - i);
                    const taux = Math.floor(Math.random() * 30) + 70;
                    
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="text-sm">
                          {format(date, 'EEE', { locale: fr })}
                          <div className="text-xs text-muted-foreground">
                            {format(date, 'dd/MM')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32">
                            <Progress 
                              value={taux} 
                              className={`h-2 ${
                                taux >= 90 ? 'bg-green-500' :
                                taux >= 80 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {taux}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Moyenne sur 7 jours:</span>
                    <span className="font-bold text-green-600">85.4%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Évolution:</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">+2.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Absences non justifiées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Absences à justifier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presences
                    .filter(p => p.statut === 'absent' && !p.justificatif)
                    .slice(0, 5)
                    .map(presence => {
                      const eleve = eleves.find(e => e.id === presence.eleve_id);
                      if (!eleve) return null;
                      
                      return (
                        <div key={presence.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {eleve.prenom} {eleve.nom.charAt(0)}.
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {eleve.classe.nom}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Demander
                          </Button>
                        </div>
                      );
                    })}
                  
                  {presences.filter(p => p.statut === 'absent' && !p.justificatif).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Toutes les absences sont justifiées</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Notifier tous les absents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Liste d'appel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en Excel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Voir calendrier mensuel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal pour ajouter une absence (exemple) */}
        <Alert className="mt-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conseil du jour</p>
                <p className="text-sm">
                  Le taux de présence actuel est de {stats.taux_presence.toFixed(1)}%. 
                  {stats.taux_presence < 90 && " Pensez à contacter les parents des élèves fréquemment absents."}
                </p>
              </div>
              <Button size="sm" variant="outline" className="ml-4">
                Voir rapport détaillé
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    </>
  );
}