import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  MapPin,
  GraduationCap,
  Heart,
  Car,
  FileText,
  Users,
  Award,
  BookOpen,
  History,
  TrendingUp,
  Edit,
  ArrowLeft,
  Download,
  Shield,
  Briefcase,
  Stethoscope,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Note {
  id: number;
  valeur: number;
  type: string;
  date_evaluation: string;
  matiere: {
    id: number;
    nom: string;
    coefficient: number;
  };
}

interface Absence {
  id: number;
  date: string;
  motif: string;
  justifiee: boolean;
}

interface Paiement {
  id: number;
  montant: number;
  type: string;
  date_paiement: string;
  statut: string;
}

interface UserLog {
  id: number;
  action: string;
  action_label: string;
  description: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  } | null;
}

interface ShowEleveProps {
  eleve: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    date_naissance: string;
    age: number;
    sexe: 'M' | 'F';
    sexe_label: string;
    lieu_naissance: string | null;
    nationalite: string;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    
    // Parents
    nom_pere: string | null;
    profession_pere: string | null;
    telephone_pere: string | null;
    nom_mere: string | null;
    profession_mere: string | null;
    telephone_mere: string | null;
    nom_tuteur: string | null;
    profession_tuteur: string | null;
    telephone_tuteur: string | null;
    adresse_tuteur: string | null;
    
    // Scolarité
    classe: {
      id: number;
      nom_classe: string;
      niveau: string;
      section: string | null;
      professeur_principal: {
        id: number;
        name: string;
        email: string;
      } | null;
    };
    statut: string;
    statut_label: string;
    date_inscription: string;
    date_sortie: string | null;
    motif_sortie: string | null;
    redoublant: boolean;
    annee_redoublement: number | null;
    derniere_ecole: string | null;
    derniere_classe: string | null;
    moyenne_generale: number | null;
    moyenne_actuelle: number | null;
    rang_classe: number | null;
    observations: string | null;
    
    // Santé
    antecedents_medicaux: string | null;
    groupe_sanguin: string | null;
    allergies: string | null;
    medecin_traitant: string | null;
    telephone_medecin: string | null;
    
    // Transport
    moyen_transport: string;
    nom_transporteur: string | null;
    telephone_transporteur: string | null;
    
    // Documents
    photo_url: string;
    certificat_naissance: string | null;
    bulletin_precedent: string | null;
    certificat_medical: string | null;
    autorisation_parentale: string | null;
    
    // Historique
    historique_classes: any[] | null;
    historique_notes: any[] | null;
    
    // Système
    ref: string;
    created_at: string;
    updated_at: string;
    created_by: {
      id: number;
      name: string;
      email: string;
    } | null;
    updated_by: {
      id: number;
      name: string;
      email: string;
    } | null;
    
    // Relations chargées
    notes: Note[];
    absences: Absence[];
    paiements: Paiement[];
    logs: UserLog[];
    historique_paiements: Paiement[];
  };
}

export default function ShowEleve({ eleve }: ShowEleveProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <Badge variant={variants[statut] || 'outline'}>
        {eleve.statut_label}
      </Badge>
    );
  };

  const getMoyenneColor = (moyenne: number | null) => {
    if (!moyenne) return 'text-muted-foreground';
    if (moyenne >= 15) return 'text-green-600 font-bold';
    if (moyenne >= 10) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'marche': return '🚶';
      case 'bus': return '🚌';
      case 'voiture': return '🚗';
      case 'taxi': return '🚕';
      default: return '🛵';
    }
  };

  const getTransportLabel = (transport: string) => {
    switch (transport) {
      case 'marche': return 'À pied';
      case 'bus': return 'Bus scolaire';
      case 'voiture': return 'Voiture personnelle';
      case 'taxi': return 'Taxi';
      default: return 'Autre';
    }
  };
  return (
    <>
      <Head title={eleve.nom_complet} />
      
      <DashboardLayout activeRoute="/eleves">
        <PageHeader
          title={eleve.nom_complet}
          description={`Matricule: ${eleve.matricule}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Élèves', href: '/eleves' },
            { label: eleve.nom_complet, href: `/eleves/${eleve.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/eleves">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/eleves/${eleve.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Link href={`/eleves/${eleve.id}/bulletin`}>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Bulletin
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Profil */}
          <div className="space-y-6">
            {/* Carte profil */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={eleve.photo_url} alt={eleve.nom_complet} />
                    <AvatarFallback className={`text-3xl ${eleve.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {eleve.nom.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-2xl font-bold">{eleve.nom_complet}</h2>
                    <p className="text-muted-foreground">{eleve.matricule}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getStatutBadge(eleve.statut)}
                    <Badge variant={eleve.sexe === 'M' ? 'default' : 'secondary'}>
                      {eleve.sexe === 'M' ? '👦 Garçon' : '👧 Fille'}
                    </Badge>
                    <Badge variant="outline">
                      {eleve.age} ans
                    </Badge>
                  </div>
                  
                  {eleve.moyenne_actuelle && (
                    <div className={`text-2xl font-bold ${getMoyenneColor(eleve.moyenne_actuelle)}`}>
                      Moyenne: {eleve.moyenne_actuelle.toFixed(2)}/20
                      {eleve.moyenne_actuelle >= 15 && (
                        <TrendingUp className="h-5 w-5 inline ml-2 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-4">
                  {eleve.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{eleve.telephone}</span>
                    </div>
                  )}
                  
                  {eleve.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{eleve.email}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Né(e) le {formatDate(eleve.date_naissance)}</span>
                  </div>
                  
                  {eleve.lieu_naissance && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>À {eleve.lieu_naissance}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{eleve.nationalite}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classe */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Classe actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Classe</span>
                    <span className="font-medium">{eleve.classe.nom_classe}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Niveau</span>
                    <Badge variant="outline">{eleve.classe.niveau}</Badge>
                  </div>
                  
                  {eleve.classe.section && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Section</span>
                      <span className="font-medium">{eleve.classe.section}</span>
                    </div>
                  )}
                  
                  {eleve.classe.professeur_principal && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Professeur principal</p>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {eleve.classe.professeur_principal.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{eleve.classe.professeur_principal.name}</p>
                          <p className="text-xs text-muted-foreground">{eleve.classe.professeur_principal.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t">
                    <Link href={`/classes/${eleve.classe.id}`}>
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir la classe
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transport */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Transport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Moyen</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTransportIcon(eleve.moyen_transport)}</span>
                      <span>{getTransportLabel(eleve.moyen_transport)}</span>
                    </div>
                  </div>
                  
                  {eleve.nom_transporteur && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Transporteur</span>
                      <span className="font-medium">{eleve.nom_transporteur}</span>
                    </div>
                  )}
                  
                  {eleve.telephone_transporteur && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Téléphone</span>
                      <span>{eleve.telephone_transporteur}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne centrale et droite - Onglets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="informations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="informations" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations
                </TabsTrigger>
                <TabsTrigger value="scolarite" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Scolarité
                </TabsTrigger>
                <TabsTrigger value="sante" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Santé
                </TabsTrigger>
                <TabsTrigger value="activite" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Activité
                </TabsTrigger>
              </TabsList>

              {/* Onglet Informations */}
              <TabsContent value="informations" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Parents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {eleve.nom_pere && (
                        <div>
                          <p className="text-sm text-muted-foreground">Père</p>
                          <div className="space-y-1">
                            <p className="font-medium">{eleve.nom_pere}</p>
                            {eleve.profession_pere && (
                              <p className="text-sm flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {eleve.profession_pere}
                              </p>
                            )}
                            {eleve.telephone_pere && (
                              <p className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {eleve.telephone_pere}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {eleve.nom_mere && (
                        <div>
                          <p className="text-sm text-muted-foreground">Mère</p>
                          <div className="space-y-1">
                            <p className="font-medium">{eleve.nom_mere}</p>
                            {eleve.profession_mere && (
                              <p className="text-sm flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {eleve.profession_mere}
                              </p>
                            )}
                            {eleve.telephone_mere && (
                              <p className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {eleve.telephone_mere}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {eleve.nom_tuteur && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Tuteur</p>
                          <div className="space-y-1">
                            <p className="font-medium">{eleve.nom_tuteur}</p>
                            {eleve.profession_tuteur && (
                              <p className="text-sm">
                                <Briefcase className="h-3 w-3 inline mr-1" />
                                {eleve.profession_tuteur}
                              </p>
                            )}
                            {eleve.telephone_tuteur && (
                              <p className="text-sm">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {eleve.telephone_tuteur}
                              </p>
                            )}
                            {eleve.adresse_tuteur && (
                              <p className="text-sm">
                                <Home className="h-3 w-3 inline mr-1" />
                                {eleve.adresse_tuteur}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Adresse et contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Adresse et contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {eleve.adresse && (
                        <div>
                          <p className="text-sm text-muted-foreground">Adresse</p>
                          <p className="flex items-start gap-2">
                            <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span>{eleve.adresse}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Date d'inscription</p>
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(eleve.date_inscription)}
                          </p>
                        </div>
                        
                        {eleve.date_sortie && (
                          <div>
                            <p className="text-sm text-muted-foreground">Date de sortie</p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(eleve.date_sortie)}
                            </p>
                            {eleve.motif_sortie && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Motif: {eleve.motif_sortie}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* École précédente */}
                      {(eleve.derniere_ecole || eleve.derniere_classe) && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-2">École précédente</p>
                          {eleve.derniere_ecole && (
                            <p className="text-sm">{eleve.derniere_ecole}</p>
                          )}
                          {eleve.derniere_classe && (
                            <p className="text-sm">Classe: {eleve.derniere_classe}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Observations */}
                  {eleve.observations && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Observations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{eleve.observations}</p>
                      </CardContent>
                    </Card>
                  )}

                  {eleve.historique_paiements && ( 
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Historique des paiements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {eleve.historique_paiements.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              Aucun paiement enregistré
                            </p>
                          ) : (
                            <div className="space-y-3"> 
                              {eleve.historique_paiements.map((paiement) => (
                                <div key={paiement.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <p className="font-medium">{paiement.reference}</p>
                                    <p className="text-xs text-muted-foreground"> {paiement.tranche.nom_tranche} </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(paiement.date_paiement)}  
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold">
                                      {Number(paiement.montant).toFixed(2)} $
                                    </p>
                                    <Badge variant='default'>
                                      Effectué
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>

                          )}
                        </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Onglet Scolarité */}
              <TabsContent value="scolarite" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notes récentes */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">Notes récentes</CardTitle>
                      <Badge variant="outline">
                        {eleve.notes.length} note(s)
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {eleve.notes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune note enregistrée
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {eleve.notes.map((note) => (
                            <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{note.matiere.nom}</p>
                                <p className="text-xs text-muted-foreground">
                                  {note.type} • {formatDate(note.date_evaluation)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${getMoyenneColor(note.valeur)}`}>
                                  {note.valeur.toFixed(2)}/20
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Coef: {note.matiere.coefficient}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Absences */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium">Absences</CardTitle>
                      <Badge variant="outline">
                        {eleve.absences.length} absence(s)
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {eleve.absences.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune absence enregistrée
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {eleve.absences.map((absence) => (
                            <div key={absence.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{formatDate(absence.date)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {absence.motif}
                                </p>
                              </div>
                              <Badge variant={absence.justifiee ? 'outline' : 'destructive'}>
                                {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Statistiques */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Statistiques scolaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{Number(eleve.moyenne_generale)?.toFixed(2) || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Moyenne générale</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{eleve.rang_classe || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Rang dans la classe</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{eleve.notes.length}</p>
                          <p className="text-sm text-muted-foreground">Notes enregistrées</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">
                            {eleve.redoublant ? 'Oui' : 'Non'}
                          </p>
                          <p className="text-sm text-muted-foreground">Redoublant</p>
                          {eleve.annee_redoublement && (
                            <p className="text-xs text-muted-foreground">
                              Depuis {eleve.annee_redoublement}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Santé */}
              <TabsContent value="sante" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations médicales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Informations médicales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {eleve.groupe_sanguin && (
                        <div>
                          <p className="text-sm text-muted-foreground">Groupe sanguin</p>
                          <p className="font-medium">{eleve.groupe_sanguin}</p>
                        </div>
                      )}
                      
                      {eleve.allergies && (
                        <div>
                          <p className="text-sm text-muted-foreground">Allergies</p>
                          <p className="text-sm whitespace-pre-line">{eleve.allergies}</p>
                        </div>
                      )}
                      
                      {eleve.antecedents_medicaux && (
                        <div>
                          <p className="text-sm text-muted-foreground">Antécédents médicaux</p>
                          <p className="text-sm whitespace-pre-line">{eleve.antecedents_medicaux}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Médecin traitant */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Médecin traitant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {eleve.medecin_traitant ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Nom</p>
                            <p className="font-medium">{eleve.medecin_traitant}</p>
                          </div>
                          
                          {eleve.telephone_medecin && (
                            <div>
                              <p className="text-sm text-muted-foreground">Téléphone</p>
                              <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {eleve.telephone_medecin}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          Aucun médecin renseigné
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Documents médicaux */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Documents médicaux</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eleve.certificat_medical ? (
                          <div className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Certificat médical</p>
                                <p className="text-sm text-muted-foreground">Document médical</p>
                              </div>
                            </div>
                            <a 
                              href={`/storage/${eleve.certificat_medical}`} 
                              target="_blank"
                              className="text-primary hover:underline text-sm"
                            >
                              Télécharger
                            </a>
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4 text-center text-muted-foreground">
                            <p>Certificat médical non fourni</p>
                          </div>
                        )}
                        
                        {eleve.certificat_naissance ? (
                          <div className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Certificat de naissance</p>
                                <p className="text-sm text-muted-foreground">Acte de naissance</p>
                              </div>
                            </div>
                            <a 
                              href={`/storage/${eleve.certificat_naissance}`} 
                              target="_blank"
                              className="text-primary hover:underline text-sm"
                            >
                              Télécharger
                            </a>
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4 text-center text-muted-foreground">
                            <p>Certificat de naissance non fourni</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Activité */}
              <TabsContent value="activite" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Historique d'activité */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Journal d'activité</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {eleve.logs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune activité enregistrée
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {eleve.logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <History className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    {log.user?.name || 'Système'}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(log.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {log.description}
                                </p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {log.action_label}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Informations système */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Informations système</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Référence</p>
                        <p className="font-mono text-sm">{eleve.ref}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Créé le</p>
                        <p className="text-sm">{formatDateTime(eleve.created_at)}</p>
                        {eleve.created_by && (
                          <p className="text-xs text-muted-foreground">
                            Par {eleve.created_by.name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Dernière modification</p>
                        <p className="text-sm">{formatDateTime(eleve.updated_at)}</p>
                        {eleve.updated_by && (
                          <p className="text-xs text-muted-foreground">
                            Par {eleve.updated_by.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Historique des classes 
                  {eleve.historique_classes && eleve.historique_classes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Historique des classes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {eleve.historique_classes.map((historique, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{historique.classe_nom}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(historique.date_entree)} - {formatDate(historique.date_sortie)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}*/}


                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}