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
  BanknoteIcon,
  CreditCard,
  DollarSign,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Responsable {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  type_responsable: string;
  profession: string | null;
  telephone_1: string;
  email: string | null;
  adresse: string | null;
  pivot: {
    eleve_id: number;
    responsable_id: number;
    est_responsable_financier: number;
    est_contact_urgence: number;
    est_autorise_retirer: number;
    ordre_priorite: number;
    telephone_urgence: string | null;
  };
  eleves: any[];
}

interface Paiement {
  id: number;
  reference?: string;
  montant: number;
  date_paiement: string;
  statut: string;
  user?: any;
  tranche?: {
    id: number;
    nom_tranche: string;
  };
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
    
    // Nouvelle structure : Responsables
    responsables: Responsable[];
    responsable_principal: Responsable | null;
    
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
    photo: string | null;
    certificat_naissance: string | null;
    certificat_medical: string | null;
    
    // Historique
    historique_paiements: Paiement[];
    
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
  };
  fraternites: any[];
}

export default function ShowEleve({ eleve, fraternites }: ShowEleveProps) {
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).replace('$US', '$');
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

  const getTypeResponsableLabel = (type: string) => {
    switch (type) {
      case 'pere': return 'Père';
      case 'mere': return 'Mère';
      case 'tuteur': return 'Tuteur';
      default: return 'Autre';
    }
  };

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null;
    return photo.startsWith('http') ? photo : `/storage/${photo}`;
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
                    <AvatarImage 
                      src={getPhotoUrl(eleve.photo)} 
                      alt={eleve.nom_complet} 
                    />
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
                <TabsTrigger value="responsables" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Responsables
                </TabsTrigger>
                <TabsTrigger value="paiements" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Paiements
                </TabsTrigger>
                <TabsTrigger value="sante" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Santé
                </TabsTrigger>
              </TabsList>

              {/* Onglet Informations */}
              <TabsContent value="informations" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations personnelles */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Informations personnelles</CardTitle>
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

                  {/* Fraterie */}
                  {fraternites && fraternites.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Frères et sœurs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {fraternites.map((frere) => (
                            <div key={frere.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{frere.nom_complet}</p>
                                <p className="text-xs text-muted-foreground">
                                  {frere.classe?.nom_classe} • {frere.age} ans
                                </p>
                              </div>
                              <Link href={`/eleves/${frere.id}`}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                </div>
              </TabsContent>

              {/* Onglet Responsables */}
              <TabsContent value="responsables" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eleve.responsables.map((responsable, index) => (
                    <Card key={responsable.id}>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{getTypeResponsableLabel(responsable.type_responsable)}</span>
                            {responsable.pivot.est_responsable_financier && (
                              <Badge variant="default" className="text-xs">
                                <BanknoteIcon className="h-3 w-3 mr-1" />
                                Financier
                              </Badge>
                            )}
                            {responsable.pivot.est_contact_urgence && (
                              <Badge variant="secondary" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Urgence
                              </Badge>
                            )}
                          </div>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Nom complet</p>
                            <p className="font-medium">{responsable.nom_complet || `${responsable.nom} ${responsable.prenom}`}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Téléphone</p>
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {responsable.telephone_1}
                            </p>
                          </div>
                          
                          {responsable.email && (
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {responsable.email}
                              </p>
                            </div>
                          )}
                          
                          {responsable.profession && (
                            <div>
                              <p className="text-sm text-muted-foreground">Profession</p>
                              <p className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                {responsable.profession}
                              </p>
                            </div>
                          )}
                          
                          {responsable.adresse && (
                            <div>
                              <p className="text-sm text-muted-foreground">Adresse</p>
                              <p className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                {responsable.adresse}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Priorité</p>
                              <p className="text-sm font-medium">#{responsable.pivot.ordre_priorite}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Autorisé à retirer</p>
                              <p className="text-sm font-medium">
                                {responsable.pivot.est_autorise_retirer ? 'Oui' : 'Non'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Autres enfants du même responsable */}
                        {responsable.eleves && responsable.eleves.length > 0 && (
                          <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Autres enfants</p>
                            <div className="space-y-2">
                              {responsable.eleves.map((enfant) => (
                                <div key={enfant.id} className="flex items-center justify-between text-sm">
                                  <span>{enfant.nom_complet}</span>
                                  <Link href={`/eleves/${enfant.id}`}>
                                    <Button size="sm" variant="ghost" className="h-6 px-2">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Statistiques des responsables */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Statistiques des responsables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{eleve.responsables.length}</p>
                          <p className="text-sm text-muted-foreground">Responsables</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">
                            {eleve.responsables.filter(r => r.pivot.est_responsable_financier).length}
                          </p>
                          <p className="text-sm text-muted-foreground">Financiers</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">
                            {eleve.responsables.filter(r => r.pivot.est_contact_urgence).length}
                          </p>
                          <p className="text-sm text-muted-foreground">Urgence</p>
                        </div>
                        
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">
                            {eleve.responsables.filter(r => r.pivot.est_autorise_retirer).length}
                          </p>
                          <p className="text-sm text-muted-foreground">Peut retirer</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Paiements */}
              <TabsContent value="paiements" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Historique des paiements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!eleve.historique_paiements || eleve.historique_paiements.length === 0 ? (
                        <div className="text-center py-8">
                          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Aucun paiement enregistré</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Les paiements apparaîtront ici lorsqu'ils seront effectués
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {eleve.historique_paiements.map((paiement) => (
                            <div key={paiement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                  <p className="font-medium">{paiement.reference || `PAI-${paiement.id}`}</p>
                                  <Badge variant={paiement.statut === 'complet' ? 'default' : 'outline'}>
                                    {paiement.statut === 'complet' ? 'Complet' : 'Partiel'}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                  {paiement.tranche && (
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">Tranche:</span>{' '}
                                      <span className="font-medium">{paiement.tranche.nom_tranche}</span>
                                    </p>
                                  )}
                                  
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Date:</span>{' '}
                                    {formatDate(paiement.date_paiement)}
                                  </p>
                                  
                                  {paiement.user && (
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">Enregistré par:</span>{' '}
                                      {paiement.user.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  {formatCurrency(Number(paiement.montant))} 
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Paiement effectué
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {/* Total */}
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                            <p className="font-medium">Total payé</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(eleve.historique_paiements
                                .reduce((total, paiement) => total + Number(paiement.montant), 0))
                                } 
                            </p>
                          </div>
                        </div>
                      )}
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
                        <div className="text-center py-8">
                          <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Aucun médecin renseigné</p>
                        </div>
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
                          <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Certificat médical</p>
                                <p className="text-sm text-muted-foreground">Document médical à jour</p>
                              </div>
                            </div>
                            <a 
                              href={`/storage/${eleve.certificat_medical}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Télécharger
                            </a>
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4 text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Certificat médical non fourni</p>
                          </div>
                        )}
                        
                        {eleve.certificat_naissance ? (
                          <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
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
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Télécharger
                            </a>
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4 text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Certificat de naissance non fourni</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}