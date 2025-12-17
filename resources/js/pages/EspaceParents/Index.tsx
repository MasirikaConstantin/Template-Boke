import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Users,
  BookOpen,
  CalendarDays,
  MessageSquare,
  Bell,
  FileText,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  MessageCircle,
  Send,
  Filter,
  Printer,
  MoreVertical,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import ParentLayout from './ParentLayout';

// Types
interface Enfant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  photo?: string;
  classe: {
    id: number;
    nom: string;
    niveau: string;
    professeur_principal: string;
  };
  date_naissance: string;
  age: number;
}

interface Note {
  id: number;
  matiere: string;
  professeur: string;
  type: 'TP' | 'Interrogation' | 'Devoir' | 'Examen';
  note: number;
  note_sur: number;
  date: string;
  appreciation: string;
  coefficient: number;
}

interface Presence {
  id: number;
  date: string;
  statut: 'present' | 'absent' | 'retard' | 'exclu' | 'malade';
  heure_arrivee?: string;
  heure_depart?: string;
  cours: string[];
  retard_minutes?: number;
  raison_absence?: string;
  justificatif?: boolean;
}

interface Communication {
  id: number;
  type: 'info' | 'urgence' | 'culturel' | 'financier' | 'general';
  titre: string;
  message: string;
  date: string;
  emetteur: string;
  lu: boolean;
  important: boolean;
}

interface Bulletin {
  id: number;
  periode: string;
  moyenne_generale: number;
  rang: number;
  effectif_classe: number;
  appreciation: string;
  matieres: Array<{
    matiere: string;
    moyenne: number;
    coefficient: number;
    appreciation: string;
  }>;
}

export default function EspaceParent() {
  // États
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [selectedEnfant, setSelectedEnfant] = useState<Enfant | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'question' | 'information' | 'urgence'>('question');
  const [showNoteDetails, setShowNoteDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showPresenceDetails, setShowPresenceDetails] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState<Presence | null>(null);
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);

  // Données génériques
  useEffect(() => {
    // Enfants du parent
    const enfantsData: Enfant[] = [
      {
        id: 1,
        matricule: 'ELEV2024001',
        nom: 'Dupont',
        prenom: 'Lucas',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
        classe: {
          id: 1,
          nom: 'Terminale S',
          niveau: 'Lycée',
          professeur_principal: 'Mme. Martin'
        },
        date_naissance: '2006-05-15',
        age: 17
      },
      {
        id: 2,
        matricule: 'ELEV2024002',
        nom: 'Dupont',
        prenom: 'Emma',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        classe: {
          id: 2,
          nom: '4ème C',
          niveau: 'Collège',
          professeur_principal: 'M. Bernard'
        },
        date_naissance: '2009-08-22',
        age: 14
      }
    ];

    // Notes des enfants
    const notesData: Note[] = [
      { id: 1, matiere: 'Mathématiques', professeur: 'M. Dubois', type: 'Devoir', note: 16, note_sur: 20, date: '2024-03-10', appreciation: 'Très bon travail', coefficient: 3 },
      { id: 2, matiere: 'Physique-Chimie', professeur: 'Mme. Robert', type: 'TP', note: 14, note_sur: 20, date: '2024-03-08', appreciation: 'Bon effort', coefficient: 2 },
      { id: 3, matiere: 'Français', professeur: 'M. Thomas', type: 'Interrogation', note: 18, note_sur: 20, date: '2024-03-05', appreciation: 'Excellent', coefficient: 3 },
      { id: 4, matiere: 'Histoire-Géographie', professeur: 'Mme. Richard', type: 'Examen', note: 12, note_sur: 20, date: '2024-03-01', appreciation: 'Peut mieux faire', coefficient: 4 },
      { id: 5, matiere: 'Anglais', professeur: 'M. Petit', type: 'Devoir', note: 15, note_sur: 20, date: '2024-02-28', appreciation: 'Bon travail', coefficient: 2 },
      { id: 6, matiere: 'SVT', professeur: 'Mme. Durand', type: 'TP', note: 17, note_sur: 20, date: '2024-02-25', appreciation: 'Très bien', coefficient: 2 },
    ];

    // Présences
    const presencesData: Presence[] = [
      { id: 1, date: '2024-03-12', statut: 'present', heure_arrivee: '08:05', heure_depart: '16:30', cours: ['Math', 'Français', 'Anglais'] },
      { id: 2, date: '2024-03-11', statut: 'retard', heure_arrivee: '08:35', heure_depart: '16:45', cours: ['Physique', 'Histoire'], retard_minutes: 35 },
      { id: 3, date: '2024-03-08', statut: 'absent', cours: [], raison_absence: 'Maladie', justificatif: true },
      { id: 4, date: '2024-03-07', statut: 'present', heure_arrivee: '07:55', heure_depart: '16:15', cours: ['Math', 'SVT', 'Sport'] },
      { id: 5, date: '2024-03-06', statut: 'present', heure_arrivee: '08:00', heure_depart: '16:30', cours: ['Français', 'Anglais', 'Arts'] },
      { id: 6, date: '2024-03-05', statut: 'malade', cours: [], raison_absence: 'Fièvre', justificatif: true },
    ];

    // Communications
    const communicationsData: Communication[] = [
      { id: 1, type: 'culturel', titre: 'Journée culturelle - 25 Mars', message: 'L\'école organise une journée culturelle le 25 Mars. Participation: 15$ par élève.', date: '2024-03-10', emetteur: 'Direction', lu: false, important: true },
      { id: 2, type: 'financier', titre: 'Échéance des frais scolaires', message: 'Rappel: les frais du 2ème trimestre sont à régler avant le 31 Mars.', date: '2024-03-08', emetteur: 'Comptabilité', lu: true, important: true },
      { id: 3, type: 'info', titre: 'Réunion parents-professeurs', message: 'La réunion parents-professeurs est prévue le 20 Mars à 18h dans la salle polyvalente.', date: '2024-03-05', emetteur: 'Vie scolaire', lu: true, important: false },
      { id: 4, type: 'urgence', titre: 'Fermeture exceptionnelle', message: 'L\'école sera exceptionnellement fermée le 15 Mars pour travaux.', date: '2024-03-03', emetteur: 'Direction', lu: false, important: true },
      { id: 5, type: 'general', titre: 'Informations cantine', message: 'Le menu de la semaine du 11 Mars est disponible sur l\'espace parents.', date: '2024-03-01', emetteur: 'Service restauration', lu: true, important: false },
    ];

    // Bulletins
    const bulletinsData: Bulletin[] = [
      {
        id: 1,
        periode: '1er Trimestre 2023-2024',
        moyenne_generale: 14.5,
        rang: 8,
        effectif_classe: 32,
        appreciation: 'Élève sérieux et appliqué. Bonnes résultats dans l\'ensemble.',
        matieres: [
          { matiere: 'Mathématiques', moyenne: 16, coefficient: 4, appreciation: 'Excellent' },
          { matiere: 'Physique-Chimie', moyenne: 14, coefficient: 3, appreciation: 'Bon' },
          { matiere: 'Français', moyenne: 15, coefficient: 4, appreciation: 'Très bien' },
          { matiere: 'Histoire-Géographie', moyenne: 13, coefficient: 3, appreciation: 'Satisfaisant' },
          { matiere: 'Anglais', moyenne: 16, coefficient: 2, appreciation: 'Excellent' },
          { matiere: 'SVT', moyenne: 15, coefficient: 2, appreciation: 'Très bien' },
          { matiere: 'EPS', moyenne: 17, coefficient: 1, appreciation: 'Remarquable' },
        ]
      },
      {
        id: 2,
        periode: '2ème Trimestre 2023-2024',
        moyenne_generale: 15.2,
        rang: 5,
        effectif_classe: 32,
        appreciation: 'Progression notable. Continue tes efforts.',
        matieres: [
          { matiere: 'Mathématiques', moyenne: 17, coefficient: 4, appreciation: 'Excellent' },
          { matiere: 'Physique-Chimie', moyenne: 15, coefficient: 3, appreciation: 'Très bien' },
          { matiere: 'Français', moyenne: 14, coefficient: 4, appreciation: 'Bon' },
          { matiere: 'Histoire-Géographie', moyenne: 14, coefficient: 3, appreciation: 'Bon' },
          { matiere: 'Anglais', moyenne: 17, coefficient: 2, appreciation: 'Excellent' },
          { matiere: 'SVT', moyenne: 16, coefficient: 2, appreciation: 'Très bien' },
          { matiere: 'EPS', moyenne: 16, coefficient: 1, appreciation: 'Très bien' },
        ]
      }
    ];

    setEnfants(enfantsData);
    setSelectedEnfant(enfantsData[0]);
    setNotes(notesData);
    setPresences(presencesData);
    setCommunications(communicationsData);
    setBulletins(bulletinsData);
  }, []);

  // Fonctions utilitaires
  const getStatutBadge = (statut: Presence['statut']) => {
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

  const getTypeCommunicationBadge = (type: Communication['type']) => {
    const variants = {
      info: { variant: 'default' as const, label: 'Information' },
      urgence: { variant: 'destructive' as const, label: 'Urgent' },
      culturel: { variant: 'outline' as const, label: 'Culturel' },
      financier: { variant: 'secondary' as const, label: 'Financier' },
      general: { variant: 'outline' as const, label: 'Général' },
    };

    const { variant, label } = variants[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getNoteColor = (note: number, sur: number) => {
    const pourcentage = (note / sur) * 100;
    if (pourcentage >= 80) return 'text-green-600';
    if (pourcentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMoyenneColor = (moyenne: number) => {
    if (moyenne >= 15) return 'text-green-600';
    if (moyenne >= 12) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newComm: Communication = {
      id: Date.now(),
      type: 'general',
      titre: 'Message de parent',
      message: newMessage,
      date: new Date().toISOString().split('T')[0],
      emetteur: 'Parent',
      lu: false,
      important: true
    };

    setCommunications([newComm, ...communications]);
    setNewMessage('');
    alert('Votre message a été envoyé à l\'école. Vous recevrez une réponse dans les meilleurs délais.');
  };

  const handleMarkAsRead = (id: number) => {
    setCommunications(comms => 
      comms.map(comm => comm.id === id ? { ...comm, lu: true } : comm)
    );
  };

  if (!selectedEnfant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head title="Espace Parent" />

      <ParentLayout activeRoute="/parent/dashboard">
        {/* En-tête avec sélection d'enfant */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Espace Parent</h1>
              <p className="text-muted-foreground">
                Suivez la scolarité de vos enfants en temps réel
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <span className="text-sm">
                {communications.filter(c => !c.lu).length} notification{communications.filter(c => !c.lu).length > 1 ? 's' : ''} non lue{communications.filter(c => !c.lu).length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Sélection des enfants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {enfants.map(enfant => (
              <Card 
                key={enfant.id} 
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedEnfant.id === enfant.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedEnfant(enfant)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {enfant.photo ? (
                        <img 
                          src={enfant.photo} 
                          alt={`${enfant.prenom} ${enfant.nom}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">
                        {enfant.prenom} {enfant.nom}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {enfant.classe.nom} • {enfant.age} ans
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Matricule: {enfant.matricule}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="presences" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Présences
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="bulletins" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bulletins
            </TabsTrigger>
          </TabsList>

          {/* Onglet Notes */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Notes récentes de {selectedEnfant.prenom}
                  </div>
                  <Badge variant="outline">
                    Moyenne: {notes.reduce((acc, note) => acc + note.note, 0) / notes.length} / 20
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Dernières évaluations et résultats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matière</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Professeur</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notes.map((note) => (
                        <TableRow key={note.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{note.matiere}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{note.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`font-bold ${getNoteColor(note.note, note.note_sur)}`}>
                              {note.note} / {note.note_sur}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Coef. {note.coefficient}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(note.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-sm">{note.professeur}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedNote(note);
                                setShowNoteDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {notes.length} note{notes.length > 1 ? 's' : ''} ce trimestre
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger toutes les notes
                </Button>
              </CardFooter>
            </Card>

            {/* Statistiques des notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Moyenne générale</p>
                    <p className="text-3xl font-bold">
                      {(notes.reduce((acc, note) => acc + note.note, 0) / notes.length).toFixed(2)} / 20
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">+0.5 point</span>
                      <span className="text-muted-foreground">vs dernier mois</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Meilleure matière</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">Mathématiques</p>
                      <Badge variant="success">16.5/20</Badge>
                    </div>
                    <Progress value={82.5} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">À améliorer</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">Histoire-Géo</p>
                      <Badge variant="destructive">12/20</Badge>
                    </div>
                    <Progress value={60} className="h-2 bg-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Présences */}
          <TabsContent value="presences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Présences du mois
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">
                      {presences.filter(p => p.statut === 'present').length} jours présents
                    </Badge>
                    <Badge variant="destructive">
                      {presences.filter(p => p.statut === 'absent').length} absences
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Suivi des présences et absences de {selectedEnfant.prenom}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Jour</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Horaires</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead className="text-right">Détails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presences.map((presence) => (
                        <TableRow key={presence.id} className="hover:bg-muted/50">
                          <TableCell>
                            {new Date(presence.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {new Date(presence.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                          </TableCell>
                          <TableCell>
                            {getStatutBadge(presence.statut)}
                            {presence.raison_absence && (
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
                            {presence.heure_arrivee ? (
                              <div className="text-sm">
                                {presence.heure_arrivee} - {presence.heure_depart || '--:--'}
                                {presence.retard_minutes && (
                                  <div className="text-xs text-amber-600">
                                    Retard: {presence.retard_minutes} min
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Non applicable</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {presence.cours.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {presence.cours.map((cours, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {cours}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Aucun cours</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPresence(presence);
                                setShowPresenceDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Taux de présence: {((presences.filter(p => p.statut === 'present').length / presences.length) * 100).toFixed(1)}%
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Justifier une absence
                </Button>
              </CardFooter>
            </Card>

            {/* Calendrier des présences */}
            <Card>
              <CardHeader>
                <CardTitle>Calendrier mensuel</CardTitle>
                <CardDescription>
                  Vue d'ensemble des présences sur le mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour) => (
                    <div key={jour} className="font-medium text-sm py-2">
                      {jour}
                    </div>
                  ))}
                  
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const date = `2024-03-${day.toString().padStart(2, '0')}`;
                    const presence = presences.find(p => p.date === date);
                    
                    let bgColor = 'bg-gray-100';
                    if (presence) {
                      if (presence.statut === 'present') bgColor = 'bg-green-100';
                      else if (presence.statut === 'absent') bgColor = 'bg-red-100';
                      else if (presence.statut === 'retard') bgColor = 'bg-amber-100';
                      else if (presence.statut === 'malade') bgColor = 'bg-blue-100';
                    }
                    
                    return (
                      <div key={day} className={`${bgColor} rounded-lg p-2 min-h-[60px]`}>
                        <div className="font-medium">{day}</div>
                        {presence && (
                          <div className="mt-1">
                            {presence.statut === 'present' && (
                              <CheckCircle className="h-4 w-4 mx-auto text-green-600" />
                            )}
                            {presence.statut === 'absent' && (
                              <XCircle className="h-4 w-4 mx-auto text-red-600" />
                            )}
                            {presence.statut === 'retard' && (
                              <Clock className="h-4 w-4 mx-auto text-amber-600" />
                            )}
                            {presence.statut === 'malade' && (
                              <AlertCircle className="h-4 w-4 mx-auto text-blue-600" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Présent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Retard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Malade</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Communications */}
          <TabsContent value="communications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Messages de l'école */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Messages de l'école
                      </div>
                      <Badge variant="outline">
                        {communications.filter(c => !c.lu).length} non lu{communications.filter(c => !c.lu).length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {communications.map((comm) => (
                        <div 
                          key={comm.id} 
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            !comm.lu ? 'bg-gray-500 border-blue-200' : ''
                          } ${comm.important ? 'border-red-100 bg-accent' : ''}`}
                          onClick={() => handleMarkAsRead(comm.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTypeCommunicationBadge(comm.type)}
                                {comm.important && (
                                  <Badge variant="destructive">Important</Badge>
                                )}
                                {!comm.lu && (
                                  <Badge variant="outline" className="bg-blue-100">
                                    Nouveau
                                  </Badge>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-lg mb-1">{comm.titre}</h4>
                              <p className="text-muted-foreground mb-2">{comm.message}</p>
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  <span className="text-muted-foreground">
                                    <CalendarDays className="h-3 w-3 inline mr-1" />
                                    {new Date(comm.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className="text-muted-foreground">
                                    <User className="h-3 w-3 inline mr-1" />
                                    {comm.emetteur}
                                  </span>
                                </div>
                                
                                {comm.type === 'financier' && (
                                  <Button size="sm" variant="outline">
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    Payer en ligne
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Envoyer un message */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Contacter l'école
                    </CardTitle>
                    <CardDescription>
                      Envoyez un message à l'administration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Type de message</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={messageType === 'question' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMessageType('question')}
                          >
                            Question
                          </Button>
                          <Button
                            variant={messageType === 'information' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMessageType('information')}
                          >
                            Information
                          </Button>
                          <Button
                            variant={messageType === 'urgence' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setMessageType('urgence')}
                          >
                            Urgence
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Destinataire</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Direction</Badge>
                          <Badge variant="outline">Vie scolaire</Badge>
                          <Badge variant="outline">Professeur principal</Badge>
                          <Badge variant="outline">Comptabilité</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Votre message</Label>
                        <Textarea
                          placeholder="Écrivez votre message ici..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </Button>
                  </CardFooter>
                </Card>

                {/* Informations de contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contacts rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Secrétariat</p>
                        <p className="text-sm text-muted-foreground">01 23 45 67 89</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email général</p>
                        <p className="text-sm text-muted-foreground">contact@ecole.fr</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-sm text-muted-foreground">123 Rue de l'École, 75000 Paris</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Horaires secrétariat</p>
                        <p className="text-sm text-muted-foreground">Lun-Ven: 8h-12h, 13h-17h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Bulletins */}
          <TabsContent value="bulletins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bulletins scolaires
                </CardTitle>
                <CardDescription>
                  Bulletins trimestriels de {selectedEnfant.prenom}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bulletins.map((bulletin) => (
                    <div key={bulletin.id} className="p-6 border rounded-lg hover:border-primary transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{bulletin.periode}</h3>
                          <p className="text-sm text-muted-foreground">
                            Classe: {selectedEnfant.classe.nom}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getMoyenneColor(bulletin.moyenne_generale)}`}>
                            {bulletin.moyenne_generale.toFixed(2)} / 20
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rang: {bulletin.rang}/{bulletin.effectif_classe}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm italic text-muted-foreground">
                          "{bulletin.appreciation}"
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {bulletin.matieres.slice(0, 4).map((matiere, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{matiere.matiere}</p>
                              <p className="text-xs text-muted-foreground">
                                Coef. {matiere.coefficient}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${getMoyenneColor(matiere.moyenne)}`}>
                                {matiere.moyenne.toFixed(1)} / 20
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {matiere.appreciation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {bulletin.matieres.length} matières
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBulletin(bulletin);
                              setShowBulletinModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détail
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Prochain bulletin: Fin Avril 2024
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger tous les bulletins
                </Button>
              </CardFooter>
            </Card>

            {/* Évolution des résultats */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des résultats</CardTitle>
                <CardDescription>
                  Progression de la moyenne générale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bulletins.map((bulletin, idx) => (
                    <div key={bulletin.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{bulletin.periode}</span>
                          <span className={`text-sm font-bold ${getMoyenneColor(bulletin.moyenne_generale)}`}>
                            {bulletin.moyenne_generale.toFixed(2)} / 20
                          </span>
                        </div>
                        <Progress 
                          value={bulletin.moyenne_generale * 5} 
                          className="h-3"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>Rang: {bulletin.rang}/{bulletin.effectif_classe}</span>
                          {idx > 0 && (
                            <span className={
                              bulletin.moyenne_generale > bulletins[idx-1].moyenne_generale
                                ? 'text-green-600'
                                : 'text-red-600'
                            }>
                              {bulletin.moyenne_generale > bulletins[idx-1].moyenne_generale ? '↗' : '↘'}
                              {Math.abs(bulletin.moyenne_generale - bulletins[idx-1].moyenne_generale).toFixed(2)} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}

        {/* Modal Détail Note */}
        <Dialog open={showNoteDetails} onOpenChange={setShowNoteDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Détail de la note
              </DialogTitle>
            </DialogHeader>
            
            {selectedNote && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Matière</p>
                    <p className="font-medium">{selectedNote.matiere}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{selectedNote.type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className={`text-2xl font-bold ${getNoteColor(selectedNote.note, selectedNote.note_sur)}`}>
                      {selectedNote.note} / {selectedNote.note_sur}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pourcentage</p>
                    <p className="font-medium">
                      {((selectedNote.note / selectedNote.note_sur) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedNote.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Professeur</p>
                  <p className="font-medium">{selectedNote.professeur}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Coefficient</p>
                  <p className="font-medium">{selectedNote.coefficient}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Appréciation</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="italic">{selectedNote.appreciation}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Impact sur la moyenne</p>
                  <Progress 
                    value={(selectedNote.note / selectedNote.note_sur) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNoteDetails(false)}>
                Fermer
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Détail Présence */}
        <Dialog open={showPresenceDetails} onOpenChange={setShowPresenceDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Détail de la présence
              </DialogTitle>
            </DialogHeader>
            
            {selectedPresence && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-lg">
                      {new Date(selectedPresence.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {getStatutBadge(selectedPresence.statut)}
                </div>
                
                {selectedPresence.heure_arrivee && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Heure d'arrivée</p>
                      <p className="font-medium">{selectedPresence.heure_arrivee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Heure de départ</p>
                      <p className="font-medium">{selectedPresence.heure_depart || '--:--'}</p>
                    </div>
                  </div>
                )}
                
                {selectedPresence.retard_minutes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="font-medium text-amber-800">
                        Retard de {selectedPresence.retard_minutes} minutes
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedPresence.raison_absence && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="space-y-2">
                      <p className="font-medium text-blue-800">Raison de l'absence</p>
                      <p className="text-blue-700">{selectedPresence.raison_absence}</p>
                      {selectedPresence.justificatif && (
                        <Badge variant="outline" className="bg-green-100">
                          Justificatif fourni
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedPresence.cours.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Cours de la journée</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPresence.cours.map((cours, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {cours}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Action</p>
                  <div className="flex gap-2">
                    {selectedPresence.statut === 'absent' && !selectedPresence.justificatif && (
                      <Button className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Envoyer justificatif
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter l'école
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPresenceDetails(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Bulletin */}
        <Dialog open={showBulletinModal} onOpenChange={setShowBulletinModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Bulletin scolaire
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedEnfant?.classe.nom}</Badge>
                  <Badge variant="outline">{selectedBulletin?.periode}</Badge>
                </div>
              </DialogTitle>
              <DialogDescription>
                Détail complet du bulletin de {selectedEnfant?.prenom} {selectedEnfant?.nom}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBulletin && (
              <div className="space-y-6">
                {/* En-tête du bulletin */}
                <div className="border rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Élève</p>
                      <p className="font-bold text-lg">{selectedEnfant?.prenom} {selectedEnfant?.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Matricule: {selectedEnfant?.matricule}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Classe</p>
                      <p className="font-bold text-lg">{selectedEnfant?.classe.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Professeur principal: {selectedEnfant?.classe.professeur_principal}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Moyenne générale</p>
                      <p className={`text-4xl font-bold ${getMoyenneColor(selectedBulletin.moyenne_generale)}`}>
                        {selectedBulletin.moyenne_generale.toFixed(2)} / 20
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rang: {selectedBulletin.rang}/{selectedBulletin.effectif_classe}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Appréciation générale */}
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2">Appréciation générale</h3>
                  <p className="text-muted-foreground italic">"{selectedBulletin.appreciation}"</p>
                </div>
                
                {/* Tableau des matières */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matière</TableHead>
                        <TableHead>Coefficient</TableHead>
                        <TableHead>Moyenne</TableHead>
                        <TableHead>Appréciation</TableHead>
                        <TableHead>Évolution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBulletin.matieres.map((matiere, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{matiere.matiere}</TableCell>
                          <TableCell>{matiere.coefficient}</TableCell>
                          <TableCell>
                            <span className={`font-bold ${getMoyenneColor(matiere.moyenne)}`}>
                              {matiere.moyenne.toFixed(1)} / 20
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{matiere.appreciation}</div>
                          </TableCell>
                          <TableCell>
                            {idx % 3 === 0 ? (
                              <div className="flex items-center text-green-600">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span>+1.2</span>
                              </div>
                            ) : idx % 3 === 1 ? (
                              <div className="flex items-center text-red-600">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                <span>-0.5</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-600">
                                <span>→</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Résumé statistique */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Meilleure matière</p>
                    <p className="font-bold text-lg text-green-600">
                      Mathématiques: 16.0
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">À améliorer</p>
                    <p className="font-bold text-lg text-red-600">
                      Histoire-Géo: 13.0
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Progression</p>
                    <p className="font-bold text-lg text-green-600">
                      +0.7 points
                    </p>
                  </div>
                </div>
                
                {/* Signature */}
                <div className="flex justify-between pt-6 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Signature du professeur principal</p>
                    <p className="font-medium">{selectedEnfant?.classe.professeur_principal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Date d'édition</p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => setShowBulletinModal(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ParentLayout>
    </>
  );
}