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
  Briefcase,
  Building,
  DollarSign,
  Award,
  School,
  BookOpen,
  Users,
  Clock,
  FileText,
  Download,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  UserCheck,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Classe {
  id: number;
  nom_classe: string;
  niveau: string;
  matiere?: {
    id: number;
    nom: string;
  };
  pivot?: {
    volume_horaire: number;
    matiere_id: number;
  };
}

interface Matiere {
  id: number;
  nom: string;
  coefficient: number;
}

interface ProfesseurShowProps {
  professeur: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    date_naissance: string | null;
    age: number;
    sexe: 'M' | 'F';
    lieu_naissance: string | null;
    nationalite: string;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    photo: string | null;
    
    // Profession
    statut: string;
    type_contrat: string;
    date_embauche: string;
    date_fin_contrat: string | null;
    salaire_base: number | null;
    numero_cnss: string | null;
    numero_compte_bancaire: string | null;
    nom_banque: string | null;
    anciennete: number;
    
    // Qualifications
    niveau_etude: string;
    diplome: string | null;
    specialite: string | null;
    etablissement: string | null;
    annee_obtention: number | null;
    
    // Documents
    cv: string | null;
    diplome_copie: string | null;
    contrat: string | null;
    
    // Classes et matières
    classe: {
      id: number;
      nom_classe: string;
      niveau: string;
    } | null;
    classes: Classe[];
    matieres_enseignees: Matiere[];
    
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
  stats: {
    nombre_classes: number;
    total_heures: number;
    nombre_matieres: number;
  };
  classesDisponibles: Array<{
    id: number;
    nom_classe: string;
    niveau: string;
  }>;
}

export default function ProfesseurShow({
  professeur,
  stats,
  classesDisponibles,
}: ProfesseurShowProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non renseigné';
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
    const variants: Record<string, 'success' | 'warning' | 'secondary' | 'outline'> = {
      'actif': 'success',
      'suspendu': 'warning',
      'inactif': 'secondary',
      'retraite': 'outline',
    };

    const icons: Record<string, React.ReactNode> = {
      'actif': <CheckCircle className="h-3 w-3 mr-1" />,
      'suspendu': <XCircle className="h-3 w-3 mr-1" />,
      'inactif': <UserCheck className="h-3 w-3 mr-1" />,
      'retraite': <UserCheck className="h-3 w-3 mr-1" />,
    };

    const labels: Record<string, string> = {
      'actif': 'Actif',
      'suspendu': 'Suspendu',
      'inactif': 'Inactif',
      'retraite': 'Retraité',
    };

    return (
      <Badge variant={variants[statut] || 'outline'} className="flex items-center">
        {icons[statut]}
        {labels[statut] || statut}
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

    const labels: Record<string, string> = {
      'cdi': 'CDI',
      'cdd': 'CDD',
      'vacataire': 'Vacataire',
      'stagiare': 'Stagiaire',
    };

    return (
      <Badge variant={variants[contrat] || 'outline'}>
        {labels[contrat] || contrat}
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

    const labels: Record<string, string> = {
      'doctorat': 'Doctorat',
      'master': 'Master',
      'licence': 'Licence',
      'autre': 'Autre',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[niveau] || 'bg-gray-100 text-gray-800'}`}>
        {labels[niveau] || niveau}
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

  const getPhotoUrl = (photo: string | null) => {
    if (!photo) return null;
    return photo.startsWith('http') ? photo : `/storage/${photo}`;
  };

  return (
    <>
      <Head title={professeur.nom_complet} />
      
      <DashboardLayout activeRoute="/professeurs">
        <PageHeader
          title={professeur.nom_complet}
          description={`Matricule: ${professeur.matricule}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Professeurs', href: '/professeurs' },
            { label: professeur.nom_complet, href: `/professeurs/${professeur.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/professeurs">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/professeurs/${professeur.id}/affectation`}>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Affectations
                </Button>
              </Link>
              <Link href={`/professeurs/${professeur.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
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
                      src={getPhotoUrl(professeur.photo)} 
                      alt={professeur.nom_complet} 
                    />
                    <AvatarFallback className={`text-3xl ${professeur.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {professeur.nom.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-2xl font-bold">{professeur.nom_complet}</h2>
                    <p className="text-muted-foreground">{professeur.matricule}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getStatutBadge(professeur.statut)}
                    <Badge variant={professeur.sexe === 'M' ? 'default' : 'secondary'}>
                      {professeur.sexe === 'M' ? '👨 Homme' : '👩 Femme'}
                    </Badge>
                    {professeur.age && (
                      <Badge variant="outline">
                        {professeur.age} ans
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getNiveauEtudeBadge(professeur.niveau_etude)}
                    {getContratBadge(professeur.type_contrat)}
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  {professeur.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{professeur.telephone}</span>
                    </div>
                  )}
                  
                  {professeur.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{professeur.email}</span>
                    </div>
                  )}
                  
                  {professeur.date_naissance && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Né(e) le {formatDate(professeur.date_naissance)}</span>
                    </div>
                  )}
                  
                  {professeur.lieu_naissance && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>À {professeur.lieu_naissance}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{professeur.nationalite}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classe principale */}
            {professeur.classe && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Classe principale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Classe</span>
                      <span className="font-medium">{professeur.classe.nom_classe}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Niveau</span>
                      <Badge variant="outline">{professeur.classe.niveau}</Badge>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Link href={`/classes/${professeur.classe.id}`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir la classe
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold text-center">{stats.nombre_classes}</p>
                    <p className="text-xs text-muted-foreground text-center">Classes</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold text-center">{stats.total_heures}h</p>
                    <p className="text-xs text-muted-foreground text-center">Heures/semaine</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold text-center">{stats.nombre_matieres}</p>
                    <p className="text-xs text-muted-foreground text-center">Matières</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold text-center">{professeur.anciennete}</p>
                    <p className="text-xs text-muted-foreground text-center">Années d'expérience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne centrale et droite - Onglets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profession" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profession" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Profession
                </TabsTrigger>
                <TabsTrigger value="qualifications" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Qualifications
                </TabsTrigger>
                <TabsTrigger value="affectations" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Affectations
                </TabsTrigger>
              </TabsList>

              {/* Onglet Profession */}
              <TabsContent value="profession" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Informations professionnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Statut</span>
                          {getStatutBadge(professeur.statut)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Type de contrat</span>
                          {getContratBadge(professeur.type_contrat)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Date d'embauche</span>
                          <span className="text-sm font-medium">
                            {formatDate(professeur.date_embauche)}
                          </span>
                        </div>
                        
                        {professeur.date_fin_contrat && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Date fin contrat</span>
                            <span className="text-sm font-medium">
                              {formatDate(professeur.date_fin_contrat)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Ancienneté</span>
                          <span className="text-sm font-medium">
                            {professeur.anciennete} an(s)
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Salaire de base</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatSalaire(professeur.salaire_base)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Informations bancaires</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {professeur.numero_cnss && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Numéro CNSS</p>
                          <p className="text-sm font-medium">{professeur.numero_cnss}</p>
                        </div>
                      )}
                      
                      {professeur.numero_compte_bancaire && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Compte bancaire</p>
                          <p className="text-sm font-medium">{professeur.numero_compte_bancaire}</p>
                        </div>
                      )}
                      
                      {professeur.nom_banque && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Banque</p>
                          <p className="text-sm font-medium">{professeur.nom_banque}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {professeur.cv && (
                          <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">CV</p>
                                <p className="text-sm text-muted-foreground">Curriculum Vitae</p>
                              </div>
                            </div>
                            <a 
                              href={`/storage/${professeur.cv}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                        
                        {professeur.diplome_copie && (
                          <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Diplôme</p>
                                <p className="text-sm text-muted-foreground">Copie certifiée</p>
                              </div>
                            </div>
                            <a 
                              href={`/storage/${professeur.diplome_copie}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                        
                        {professeur.contrat && (
                          <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Contrat</p>
                                <p className="text-sm text-muted-foreground">Contrat de travail</p>
                              </div>
                            </div>
                            <a 
                              href={`/storage/${professeur.contrat}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Qualifications */}
              <TabsContent value="qualifications" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Formation académique</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Niveau d'étude</span>
                          {getNiveauEtudeBadge(professeur.niveau_etude)}
                        </div>
                        
                        {professeur.diplome && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Diplôme obtenu</p>
                            <p className="text-sm font-medium">{professeur.diplome}</p>
                          </div>
                        )}
                        
                        {professeur.specialite && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Spécialité</p>
                            <p className="text-sm font-medium">{professeur.specialite}</p>
                          </div>
                        )}
                        
                        {professeur.etablissement && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Établissement</p>
                            <p className="text-sm font-medium">{professeur.etablissement}</p>
                          </div>
                        )}
                        
                        {professeur.annee_obtention && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Année d'obtention</p>
                            <p className="text-sm font-medium">{professeur.annee_obtention}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Matières enseignées */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Matières enseignées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {professeur.matieres_enseignees.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">Aucune matière assignée</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {professeur.matieres_enseignees.map((matiere) => (
                            <div key={matiere.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{matiere.nom}</p>
                                <p className="text-xs text-muted-foreground">
                                  Coefficient: {matiere.coefficient}
                                </p>
                              </div>
                              <Badge variant="outline">Enseignée</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Adresse */}
                  {professeur.adresse && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Adresse</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-3">
                          <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <p className="text-sm whitespace-pre-line">{professeur.adresse}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Onglet Affectations */}
              <TabsContent value="affectations" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Classes enseignées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {professeur.classes.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">Aucune classe assignée</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Utilisez la page d'affectation pour assigner des classes
                          </p>
                          <Link href={`/professeurs/${professeur.id}/affectation`} className="mt-4 inline-block">
                            <Button size="sm">
                              <Users className="h-4 w-4 mr-2" />
                              Gérer les affectations
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 text-sm font-medium">Classe</th>
                                <th className="text-left py-3 px-4 text-sm font-medium">Volume horaire</th>
                                <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {professeur.classes.map((classe) => (
                                <tr key={classe.id} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-4">
                                    <div>
                                      <p className="font-medium">{classe.nom_classe}</p>
                                      <p className="text-xs text-muted-foreground">{classe.niveau}</p>
                                    </div>
                                  </td>
                                  
                                  <td className="py-3 px-4">
                                    {classe.pivot?.volume_horaire ? (
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{classe.pivot.volume_horaire}h/semaine</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Non défini</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Link href={`/classes/${classe.id}`}>
                                      <Button size="sm" variant="ghost">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Classes disponibles pour affectation */}
                  {classesDisponibles.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Classes disponibles pour affectation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {classesDisponibles.map((classe) => (
                            <div key={classe.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{classe.nom_classe}</p>
                                <p className="text-xs text-muted-foreground">{classe.niveau}</p>
                              </div>
                              <Link href={`/professeurs/${professeur.id}/affectation`}>
                                <Button size="sm" variant="outline">
                                  <Users className="h-4 w-4 mr-2" />
                                  Affecter
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Informations système */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Informations système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Référence unique</p>
                    <p className="font-mono text-sm">{professeur.ref}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Créé le</p>
                    <p className="text-sm">{formatDateTime(professeur.created_at)}</p>
                    {professeur.created_by && (
                      <p className="text-xs text-muted-foreground">
                        Par {professeur.created_by.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dernière modification</p>
                    <p className="text-sm">{formatDateTime(professeur.updated_at)}</p>
                    {professeur.updated_by && (
                      <p className="text-xs text-muted-foreground">
                        Par {professeur.updated_by.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}