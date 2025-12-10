import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  AlertCircle,
  Save,
  Eye,
  Calendar,
  Phone,
  Mail,
  Home,
  GraduationCap,
  Heart,
  Car,
  FileText,
  MapPin,
  Briefcase,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';

interface EleveEditProps {
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
    classe_id: number;
    statut: string;
    date_inscription: string;
    date_sortie: string | null;
    motif_sortie: string | null;
    redoublant: boolean;
    annee_redoublement: number | null;
    derniere_ecole: string | null;
    derniere_classe: string | null;
    moyenne_generale: number | null;
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
    
    // Système
    ref: string;
    created_at: string;
  };
  classes: Array<{
    id: number;
    nom_classe: string;
    niveau: string;
    section: string | null;
  }>;
  nationalites: string[];
}

export default function EditEleve({ eleve, classes, nationalites }: EleveEditProps) {
  const { data, setData, put, processing, errors, reset } = useForm({
    // Identité
    nom: eleve.nom,
    prenom: eleve.prenom,
    date_naissance: eleve.date_naissance.split('T')[0],
    sexe: eleve.sexe,
    lieu_naissance: eleve.lieu_naissance || '',
    nationalite: eleve.nationalite,
    adresse: eleve.adresse || '',
    telephone: eleve.telephone || '',
    email: eleve.email || '',
    
    // Parents
    nom_pere: eleve.nom_pere || '',
    profession_pere: eleve.profession_pere || '',
    telephone_pere: eleve.telephone_pere || '',
    nom_mere: eleve.nom_mere || '',
    profession_mere: eleve.profession_mere || '',
    telephone_mere: eleve.telephone_mere || '',
    nom_tuteur: eleve.nom_tuteur || '',
    profession_tuteur: eleve.profession_tuteur || '',
    telephone_tuteur: eleve.telephone_tuteur || '',
    adresse_tuteur: eleve.adresse_tuteur || '',
    
    // Scolarité
    classe_id: eleve.classe_id.toString(),
    statut: eleve.statut,
    redoublant: eleve.redoublant,
    annee_redoublement: eleve.annee_redoublement?.toString() || '',
    derniere_ecole: eleve.derniere_ecole || '',
    derniere_classe: eleve.derniere_classe || '',
    
    // Santé
    antecedents_medicaux: eleve.antecedents_medicaux || '',
    groupe_sanguin: eleve.groupe_sanguin || '',
    allergies: eleve.allergies || '',
    medecin_traitant: eleve.medecin_traitant || '',
    telephone_medecin: eleve.telephone_medecin || '',
    
    // Transport
    moyen_transport: eleve.moyen_transport,
    nom_transporteur: eleve.nom_transporteur || '',
    telephone_transporteur: eleve.telephone_transporteur || '',
    
    // Observations et sortie
    observations: eleve.observations || '',
    date_sortie: eleve.date_sortie ? eleve.date_sortie.split('T')[0] : '',
    motif_sortie: eleve.motif_sortie || '',
  });

  const [activeTab, setActiveTab] = useState('identite');
  const [showStatutWarning, setShowStatutWarning] = useState(false);

  useEffect(() => {
    // Avertissement si changement de statut vers inactif/transféré/exclu
    if (['inactif', 'transfere', 'exclus'].includes(data.statut) && eleve.statut === 'actif') {
      setShowStatutWarning(true);
    } else {
      setShowStatutWarning(false);
    }
  }, [data.statut, eleve.statut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showStatutWarning && !data.date_sortie) {
      if (!confirm('Vous changez le statut de l\'élève. Voulez-vous continuer sans date de sortie ?')) {
        return;
      }
    }
    
    put(`/eleves/${eleve.id}`);
  };

  const calculateAge = () => {
    if (!data.date_naissance) return null;
    const birthDate = new Date(data.date_naissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const niveauxTransport = [
    { value: 'marche', label: 'À pied' },
    { value: 'bus', label: 'Bus scolaire' },
    { value: 'voiture', label: 'Voiture personnelle' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'autre', label: 'Autre' },
  ];

  const statuts = [
    { value: 'actif', label: 'Actif', color: 'success' },
    { value: 'inactif', label: 'Inactif', color: 'warning' },
    { value: 'transfere', label: 'Transféré', color: 'secondary' },
    { value: 'exclus', label: 'Exclus', color: 'destructive' },
    { value: 'diplome', label: 'Diplômé', color: 'outline' },
  ];

  const getStatutColor = (statut: string) => {
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj?.color || 'default';
  };

  return (
    <>
      <Head title={`Modifier ${eleve.nom_complet}`} />
      
      <DashboardLayout activeRoute="/eleves">
        <PageHeader
          title={`Modifier ${eleve.nom_complet}`}
          description={`Matricule: ${eleve.matricule}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Élèves', href: '/eleves' },
            { label: 'Modifier', href: `/eleves/${eleve.id}/edit` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/eleves/${eleve.id}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir
                </Button>
              </Link>
              <Link href="/eleves">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Profil et actions */}
          <div className="space-y-6">
            {/* Profil */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={eleve.photo_url} alt={eleve.nom_complet} />
                    <AvatarFallback className={eleve.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                      {eleve.nom.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-xl font-bold">{eleve.nom_complet}</h2>
                    <p className="text-sm text-muted-foreground">{eleve.matricule}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant={getStatutColor(eleve.statut) as any}>
                      {eleve.statut_label}
                    </Badge>
                    <Badge variant={eleve.sexe === 'M' ? 'default' : 'secondary'}>
                      {eleve.sexe_label}
                    </Badge>
                    <Badge variant="outline">
                      {eleve.age} ans
                    </Badge>
                  </div>
                  
                  {eleve.moyenne_generale && (
                    <div className={`text-lg font-bold ${eleve.moyenne_generale >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                      Moyenne: {eleve.moyenne_generale.toFixed(2)}/20
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Informations rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date d'inscription</p>
                  <p className="text-sm">{new Date(eleve.date_inscription).toLocaleDateString('fr-FR')}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Classe actuelle</p>
                  <p className="text-sm font-medium">
                    {classes.find(c => c.id === eleve.classe_id)?.nom_classe}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Référence</p>
                  <p className="text-sm font-mono">{eleve.ref}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Créé le</p>
                  <p className="text-sm">{new Date(eleve.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/eleves/${eleve.id}/bulletin`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Générer bulletin
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Voulez-vous vraiment réinitialiser tous les champs ?')) {
                      reset();
                    }
                  }}
                >
                  <span className="mr-2">↺</span>
                  Réinitialiser
                </Button>
                
                <div className="pt-3 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer l'élève "${eleve.nom_complet}" ? Cette action est irréversible.`)) {
                        // router.delete(`/eleves/${eleve.id}`)
                      }
                    }}
                  >
                    Supprimer l'élève
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne centrale et droite - Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Modifier l'élève
                </CardTitle>
                <CardDescription>
                  Mettez à jour les informations de l'élève
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avertissement statut */}
                  {showStatutWarning && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Vous changez le statut de l'élève. Veuillez renseigner une date de sortie et un motif.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Messages d'erreur */}
                  {(errors.nom || errors.prenom || errors.date_naissance) && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errors.nom || errors.prenom || errors.date_naissance}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="identite" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Identité
                      </TabsTrigger>
                      <TabsTrigger value="parents" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Parents
                      </TabsTrigger>
                      <TabsTrigger value="scolarite" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Scolarité
                      </TabsTrigger>
                      <TabsTrigger value="sante" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Santé
                      </TabsTrigger>
                    </TabsList>

                    {/* Onglet Identité */}
                    <TabsContent value="identite" className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nom */}
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom *</Label>
                          <Input
                            id="nom"
                            value={data.nom}
                            onChange={e => setData('nom', e.target.value)}
                            required
                          />
                          {errors.nom && (
                            <p className="text-sm text-destructive">{errors.nom}</p>
                          )}
                        </div>

                        {/* Prénom */}
                        <div className="space-y-2">
                          <Label htmlFor="prenom">Prénom *</Label>
                          <Input
                            id="prenom"
                            value={data.prenom}
                            onChange={e => setData('prenom', e.target.value)}
                            required
                          />
                          {errors.prenom && (
                            <p className="text-sm text-destructive">{errors.prenom}</p>
                          )}
                        </div>

                        {/* Date de naissance */}
                        <div className="space-y-2">
                          <Label htmlFor="date_naissance">Date de naissance *</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="date_naissance"
                              type="date"
                              value={data.date_naissance}
                              onChange={e => setData('date_naissance', e.target.value)}
                              required
                              className="pl-10"
                            />
                          </div>
                          {data.date_naissance && (
                            <p className="text-sm text-muted-foreground">
                              Âge: {calculateAge()} ans
                            </p>
                          )}
                          {errors.date_naissance && (
                            <p className="text-sm text-destructive">{errors.date_naissance}</p>
                          )}
                        </div>

                        {/* Sexe */}
                        <div className="space-y-2">
                          <Label htmlFor="sexe">Sexe *</Label>
                          <Select
                            value={data.sexe}
                            onValueChange={value => setData('sexe', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="M">Masculin</SelectItem>
                              <SelectItem value="F">Féminin</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.sexe && (
                            <p className="text-sm text-destructive">{errors.sexe}</p>
                          )}
                        </div>

                        {/* Nationalité */}
                        <div className="space-y-2">
                          <Label htmlFor="nationalite">Nationalité *</Label>
                          <Select
                            value={data.nationalite}
                            onValueChange={value => setData('nationalite', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Nationalité" />
                            </SelectTrigger>
                            <SelectContent>
                              {nationalites.map((nationalite) => (
                                <SelectItem key={nationalite} value={nationalite}>
                                  {nationalite}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.nationalite && (
                            <p className="text-sm text-destructive">{errors.nationalite}</p>
                          )}
                        </div>

                        {/* Lieu de naissance */}
                        <div className="space-y-2">
                          <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="lieu_naissance"
                              value={data.lieu_naissance}
                              onChange={e => setData('lieu_naissance', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {errors.lieu_naissance && (
                            <p className="text-sm text-destructive">{errors.lieu_naissance}</p>
                          )}
                        </div>

                        {/* Téléphone */}
                        <div className="space-y-2">
                          <Label htmlFor="telephone">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="telephone"
                              value={data.telephone}
                              onChange={e => setData('telephone', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {errors.telephone && (
                            <p className="text-sm text-destructive">{errors.telephone}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={data.email}
                              onChange={e => setData('email', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                          )}
                        </div>

                        {/* Adresse */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="adresse">Adresse</Label>
                          <div className="relative">
                            <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Textarea
                              id="adresse"
                              value={data.adresse}
                              onChange={e => setData('adresse', e.target.value)}
                              className="pl-10"
                              rows={2}
                            />
                          </div>
                          {errors.adresse && (
                            <p className="text-sm text-destructive">{errors.adresse}</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Parents */}
                    <TabsContent value="parents" className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Père */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Père</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nom_pere">Nom complet</Label>
                              <Input
                                id="nom_pere"
                                value={data.nom_pere}
                                onChange={e => setData('nom_pere', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="profession_pere">Profession</Label>
                              <Input
                                id="profession_pere"
                                value={data.profession_pere}
                                onChange={e => setData('profession_pere', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telephone_pere">Téléphone</Label>
                              <Input
                                id="telephone_pere"
                                value={data.telephone_pere}
                                onChange={e => setData('telephone_pere', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Mère */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Mère</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nom_mere">Nom complet</Label>
                              <Input
                                id="nom_mere"
                                value={data.nom_mere}
                                onChange={e => setData('nom_mere', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="profession_mere">Profession</Label>
                              <Input
                                id="profession_mere"
                                value={data.profession_mere}
                                onChange={e => setData('profession_mere', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telephone_mere">Téléphone</Label>
                              <Input
                                id="telephone_mere"
                                value={data.telephone_mere}
                                onChange={e => setData('telephone_mere', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tuteur */}
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="text-sm font-medium">Tuteur (si différent)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nom_tuteur">Nom complet</Label>
                              <Input
                                id="nom_tuteur"
                                value={data.nom_tuteur}
                                onChange={e => setData('nom_tuteur', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="profession_tuteur">Profession</Label>
                              <Input
                                id="profession_tuteur"
                                value={data.profession_tuteur}
                                onChange={e => setData('profession_tuteur', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telephone_tuteur">Téléphone</Label>
                              <Input
                                id="telephone_tuteur"
                                value={data.telephone_tuteur}
                                onChange={e => setData('telephone_tuteur', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="adresse_tuteur">Adresse</Label>
                              <Input
                                id="adresse_tuteur"
                                value={data.adresse_tuteur}
                                onChange={e => setData('adresse_tuteur', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Scolarité */}
                    <TabsContent value="scolarite" className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Classe */}
                        <div className="space-y-2">
                          <Label htmlFor="classe_id">Classe *</Label>
                          <Select
                            value={data.classe_id}
                            onValueChange={value => setData('classe_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une classe" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classe) => (
                                <SelectItem key={classe.id} value={classe.id.toString()}>
                                  {classe.nom_classe} ({classe.niveau})
                                  {classe.section && ` - ${classe.section}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.classe_id && (
                            <p className="text-sm text-destructive">{errors.classe_id}</p>
                          )}
                        </div>

                        {/* Statut */}
                        <div className="space-y-2">
                          <Label htmlFor="statut">Statut *</Label>
                          <Select
                            value={data.statut}
                            onValueChange={value => setData('statut', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              {statuts.map((statut) => (
                                <SelectItem key={statut.value} value={statut.value}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={statut.color as any} className="text-xs">
                                      {statut.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.statut && (
                            <p className="text-sm text-destructive">{errors.statut}</p>
                          )}
                        </div>

                        {/* Redoublant */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="redoublant"
                              checked={data.redoublant}
                              onCheckedChange={(checked) => setData('redoublant', checked)}
                            />
                            <Label htmlFor="redoublant" className="cursor-pointer">
                              Élève redoublant
                            </Label>
                          </div>
                          {data.redoublant && (
                            <div className="space-y-2 mt-2">
                              <Label htmlFor="annee_redoublement">Année de redoublement</Label>
                              <Input
                                id="annee_redoublement"
                                type="number"
                                min="2000"
                                max={new Date().getFullYear()}
                                value={data.annee_redoublement}
                                onChange={e => setData('annee_redoublement', e.target.value)}
                                placeholder="2023"
                              />
                            </div>
                          )}
                        </div>

                        {/* Transport */}
                        <div className="space-y-2">
                          <Label htmlFor="moyen_transport">Moyen de transport</Label>
                          <Select
                            value={data.moyen_transport}
                            onValueChange={value => setData('moyen_transport', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Transport" />
                            </SelectTrigger>
                            <SelectContent>
                              {niveauxTransport.map((transport) => (
                                <SelectItem key={transport.value} value={transport.value}>
                                  {transport.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {data.moyen_transport === 'bus' && (
                            <div className="space-y-2 mt-2">
                              <Label htmlFor="nom_transporteur">Nom du transporteur</Label>
                              <Input
                                id="nom_transporteur"
                                value={data.nom_transporteur}
                                onChange={e => setData('nom_transporteur', e.target.value)}
                              />
                              <Label htmlFor="telephone_transporteur">Téléphone transporteur</Label>
                              <Input
                                id="telephone_transporteur"
                                value={data.telephone_transporteur}
                                onChange={e => setData('telephone_transporteur', e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        {/* École précédente */}
                        <div className="space-y-2">
                          <Label htmlFor="derniere_ecole">Dernière école</Label>
                          <Input
                            id="derniere_ecole"
                            value={data.derniere_ecole}
                            onChange={e => setData('derniere_ecole', e.target.value)}
                          />
                        </div>

                        {/* Classe précédente */}
                        <div className="space-y-2">
                          <Label htmlFor="derniere_classe">Dernière classe</Label>
                          <Input
                            id="derniere_classe"
                            value={data.derniere_classe}
                            onChange={e => setData('derniere_classe', e.target.value)}
                          />
                        </div>

                        {/* Date de sortie (si statut changé) */}
                        {['inactif', 'transfere', 'exclus'].includes(data.statut) && (
                          <div className="space-y-2">
                            <Label htmlFor="date_sortie">Date de sortie *</Label>
                            <Input
                              id="date_sortie"
                              type="date"
                              value={data.date_sortie}
                              onChange={e => setData('date_sortie', e.target.value)}
                              required
                            />
                            {errors.date_sortie && (
                              <p className="text-sm text-destructive">{errors.date_sortie}</p>
                            )}
                          </div>
                        )}

                        {/* Motif de sortie */}
                        {['inactif', 'transfere', 'exclus'].includes(data.statut) && (
                          <div className="space-y-2">
                            <Label htmlFor="motif_sortie">Motif de sortie *</Label>
                            <Textarea
                              id="motif_sortie"
                              value={data.motif_sortie}
                              onChange={e => setData('motif_sortie', e.target.value)}
                              required
                              rows={2}
                            />
                            {errors.motif_sortie && (
                              <p className="text-sm text-destructive">{errors.motif_sortie}</p>
                            )}
                          </div>
                        )}

                        {/* Observations */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="observations">Observations</Label>
                          <Textarea
                            id="observations"
                            value={data.observations}
                            onChange={e => setData('observations', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Santé */}
                    <TabsContent value="sante" className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Groupe sanguin */}
                        <div className="space-y-2">
                          <Label htmlFor="groupe_sanguin">Groupe sanguin</Label>
                          <Select
                            value={data.groupe_sanguin}
                            onValueChange={value => setData('groupe_sanguin', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Médecin traitant */}
                        <div className="space-y-2">
                          <Label htmlFor="medecin_traitant">Médecin traitant</Label>
                          <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="medecin_traitant"
                              value={data.medecin_traitant}
                              onChange={e => setData('medecin_traitant', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Téléphone médecin */}
                        <div className="space-y-2">
                          <Label htmlFor="telephone_medecin">Téléphone médecin</Label>
                          <Input
                            id="telephone_medecin"
                            value={data.telephone_medecin}
                            onChange={e => setData('telephone_medecin', e.target.value)}
                          />
                        </div>

                        {/* Allergies */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <Textarea
                            id="allergies"
                            value={data.allergies}
                            onChange={e => setData('allergies', e.target.value)}
                            rows={2}
                          />
                        </div>

                        {/* Antécédents médicaux */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="antecedents_medicaux">Antécédents médicaux</Label>
                          <Textarea
                            id="antecedents_medicaux"
                            value={data.antecedents_medicaux}
                            onChange={e => setData('antecedents_medicaux', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Boutons d'action */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex gap-2">
                      {['identite', 'parents', 'scolarite', 'sante'].map((tab, index) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 text-sm rounded-full ${
                            activeTab === tab
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {index + 1}. {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Link href="/eleves">
                        <Button type="button" variant="outline">
                          Annuler
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        {processing ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer les modifications
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}