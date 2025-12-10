import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import {
  ArrowLeft,
  UserPlus,
  AlertCircle,
  User,
  Mail,
  Phone,
  Home,
  GraduationCap,
  Heart,
  Car,
  FileText,
  Calendar,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface CreateEleveProps {
  classes: Array<{
    id: number;
    nom_classe: string;
    niveau: string;
    section: string | null;
  }>;
  nationalites: string[];
}

export default function CreateEleve({ classes, nationalites }: CreateEleveProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    // Identité
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: 'M',
    lieu_naissance: '',
    nationalite: 'Sénégalais',
    adresse: '',
    telephone: '',
    email: '',
    
    // Parents
    nom_pere: '',
    profession_pere: '',
    telephone_pere: '',
    nom_mere: '',
    profession_mere: '',
    telephone_mere: '',
    nom_tuteur: '',
    profession_tuteur: '',
    telephone_tuteur: '',
    adresse_tuteur: '',
    
    // Scolarité
    classe_id: '',
    redoublant: false,
    annee_redoublement: '',
    derniere_ecole: '',
    derniere_classe: '',
    
    // Santé
    antecedents_medicaux: '',
    groupe_sanguin: '',
    allergies: '',
    medecin_traitant: '',
    telephone_medecin: '',
    
    // Transport
    moyen_transport: 'marche',
    nom_transporteur: '',
    telephone_transporteur: '',
    
    // Observations
    observations: '',
    
    // Documents (fichiers)
    photo: null as File | null,
    certificat_naissance: null as File | null,
    bulletin_precedent: null as File | null,
    certificat_medical: null as File | null,
    autorisation_parentale: null as File | null,
  });

  const [activeTab, setActiveTab] = useState('identite');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Ajouter tous les champs textuels
    Object.keys(data).forEach(key => {
      if (key !== 'photo' && key !== 'certificat_naissance' && key !== 'bulletin_precedent' && 
          key !== 'certificat_medical' && key !== 'autorisation_parentale') {
        formData.append(key, (data as any)[key]);
      }
    });
    
    // Ajouter les fichiers
    if (data.photo) formData.append('photo', data.photo);
    if (data.certificat_naissance) formData.append('certificat_naissance', data.certificat_naissance);
    if (data.bulletin_precedent) formData.append('bulletin_precedent', data.bulletin_precedent);
    if (data.certificat_medical) formData.append('certificat_medical', data.certificat_medical);
    if (data.autorisation_parentale) formData.append('autorisation_parentale', data.autorisation_parentale);
    
    post('/eleves', {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleFileChange = (field: string, file: File | null) => {
    setData(field as any, file);
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

  return (
    <>
      <Head title="Inscrire un nouvel élève" />
      
      <DashboardLayout activeRoute="/eleves">
        <PageHeader
          title="Inscrire un nouvel élève"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Élèves', href: '/eleves' },
            { label: 'Inscrire', href: '/eleves/create' },
          ]}
          actions={
            <Link href="/eleves">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          }
        />

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Formulaire d'inscription
            </CardTitle>
            <CardDescription>
              Remplissez toutes les informations nécessaires pour inscrire un nouvel élève
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <TabsList className="grid w-full grid-cols-5">
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
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
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
                        placeholder="DUPONT"
                        required
                        autoFocus
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
                        placeholder="Jean"
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
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="sexe_m"
                            name="sexe"
                            value="M"
                            checked={data.sexe === 'M'}
                            onChange={e => setData('sexe', e.target.value)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="sexe_m" className="flex items-center gap-2">
                            <span>👦</span>
                            Masculin
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="sexe_f"
                            name="sexe"
                            value="F"
                            checked={data.sexe === 'F'}
                            onChange={e => setData('sexe', e.target.value)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="sexe_f" className="flex items-center gap-2">
                            <span>👧</span>
                            Féminin
                          </Label>
                        </div>
                      </div>
                      {errors.sexe && (
                        <p className="text-sm text-destructive">{errors.sexe}</p>
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
                          placeholder="Dakar, Sénégal"
                          className="pl-10"
                        />
                      </div>
                      {errors.lieu_naissance && (
                        <p className="text-sm text-destructive">{errors.lieu_naissance}</p>
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
                          <SelectValue placeholder="Sélectionner une nationalité" />
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

                    {/* Adresse */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse">Adresse</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="adresse"
                          value={data.adresse}
                          onChange={e => setData('adresse', e.target.value)}
                          placeholder="Rue, Ville, Quartier..."
                          className="pl-10"
                          rows={2}
                        />
                      </div>
                      {errors.adresse && (
                        <p className="text-sm text-destructive">{errors.adresse}</p>
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
                          placeholder="77 123 45 67"
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
                          placeholder="jean@exemple.com"
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Parents */}
                <TabsContent value="parents" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Père */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Père</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nom_pere">Nom complet</Label>
                          <Input
                            id="nom_pere"
                            value={data.nom_pere}
                            onChange={e => setData('nom_pere', e.target.value)}
                            placeholder="Nom du père"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profession_pere">Profession</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="profession_pere"
                              value={data.profession_pere}
                              onChange={e => setData('profession_pere', e.target.value)}
                              placeholder="Profession"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telephone_pere">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="telephone_pere"
                              value={data.telephone_pere}
                              onChange={e => setData('telephone_pere', e.target.value)}
                              placeholder="77 123 45 67"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mère */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Mère</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nom_mere">Nom complet</Label>
                          <Input
                            id="nom_mere"
                            value={data.nom_mere}
                            onChange={e => setData('nom_mere', e.target.value)}
                            placeholder="Nom de la mère"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profession_mere">Profession</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="profession_mere"
                              value={data.profession_mere}
                              onChange={e => setData('profession_mere', e.target.value)}
                              placeholder="Profession"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telephone_mere">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="telephone_mere"
                              value={data.telephone_mere}
                              onChange={e => setData('telephone_mere', e.target.value)}
                              placeholder="77 123 45 67"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tuteur */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Tuteur (si différent des parents)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nom_tuteur">Nom complet</Label>
                            <Input
                              id="nom_tuteur"
                              value={data.nom_tuteur}
                              onChange={e => setData('nom_tuteur', e.target.value)}
                              placeholder="Nom du tuteur"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profession_tuteur">Profession</Label>
                            <Input
                              id="profession_tuteur"
                              value={data.profession_tuteur}
                              onChange={e => setData('profession_tuteur', e.target.value)}
                              placeholder="Profession"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telephone_tuteur">Téléphone</Label>
                            <Input
                              id="telephone_tuteur"
                              value={data.telephone_tuteur}
                              onChange={e => setData('telephone_tuteur', e.target.value)}
                              placeholder="77 123 45 67"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adresse_tuteur">Adresse</Label>
                            <Input
                              id="adresse_tuteur"
                              value={data.adresse_tuteur}
                              onChange={e => setData('adresse_tuteur', e.target.value)}
                              placeholder="Adresse du tuteur"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Onglet Scolarité */}
                <TabsContent value="scolarite" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Classe */}
                    <div className="space-y-2 md:col-span-2">
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
                          <SelectValue placeholder="Moyen de transport" />
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
                            placeholder="Nom du transporteur"
                          />
                          <Label htmlFor="telephone_transporteur">Téléphone transporteur</Label>
                          <Input
                            id="telephone_transporteur"
                            value={data.telephone_transporteur}
                            onChange={e => setData('telephone_transporteur', e.target.value)}
                            placeholder="77 123 45 67"
                          />
                        </div>
                      )}
                    </div>

                    {/* École précédente */}
                    <div className="space-y-2">
                      <Label htmlFor="derniere_ecole">Dernière école fréquentée</Label>
                      <Input
                        id="derniere_ecole"
                        value={data.derniere_ecole}
                        onChange={e => setData('derniere_ecole', e.target.value)}
                        placeholder="Nom de l'école"
                      />
                    </div>

                    {/* Classe précédente */}
                    <div className="space-y-2">
                      <Label htmlFor="derniere_classe">Dernière classe</Label>
                      <Input
                        id="derniere_classe"
                        value={data.derniere_classe}
                        onChange={e => setData('derniere_classe', e.target.value)}
                        placeholder="Ex: 5ème A"
                      />
                    </div>

                    {/* Observations */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="observations">Observations</Label>
                      <Textarea
                        id="observations"
                        value={data.observations}
                        onChange={e => setData('observations', e.target.value)}
                        placeholder="Observations particulières..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Santé */}
                <TabsContent value="sante" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Antécédents médicaux */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="antecedents_medicaux">Antécédents médicaux</Label>
                      <Textarea
                        id="antecedents_medicaux"
                        value={data.antecedents_medicaux}
                        onChange={e => setData('antecedents_medicaux', e.target.value)}
                        placeholder="Maladies chroniques, hospitalisations, chirurgies..."
                        rows={3}
                      />
                    </div>

                    {/* Groupe sanguin */}
                    <div className="space-y-2">
                      <Label htmlFor="groupe_sanguin">Groupe sanguin</Label>
                      <Select
                        value={data.groupe_sanguin}
                        onValueChange={value => setData('groupe_sanguin', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un groupe" />
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

                    {/* Allergies */}
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={data.allergies}
                        onChange={e => setData('allergies', e.target.value)}
                        placeholder="Allergies alimentaires, médicamenteuses..."
                        rows={3}
                      />
                    </div>

                    {/* Médecin traitant */}
                    <div className="space-y-2">
                      <Label htmlFor="medecin_traitant">Médecin traitant</Label>
                      <Input
                        id="medecin_traitant"
                        value={data.medecin_traitant}
                        onChange={e => setData('medecin_traitant', e.target.value)}
                        placeholder="Dr. Nom Prénom"
                      />
                    </div>

                    {/* Téléphone médecin */}
                    <div className="space-y-2">
                      <Label htmlFor="telephone_medecin">Téléphone médecin</Label>
                      <Input
                        id="telephone_medecin"
                        value={data.telephone_medecin}
                        onChange={e => setData('telephone_medecin', e.target.value)}
                        placeholder="77 123 45 67"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Documents */}
                <TabsContent value="documents" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo */}
                    <div className="space-y-2">
                      <Label htmlFor="photo">Photo d'identité</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: JPG, PNG, Max 2MB
                      </p>
                    </div>

                    {/* Certificat de naissance */}
                    <div className="space-y-2">
                      <Label htmlFor="certificat_naissance">Certificat de naissance</Label>
                      <Input
                        id="certificat_naissance"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('certificat_naissance', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, PNG, Max 5MB
                      </p>
                    </div>

                    {/* Bulletin précédent */}
                    <div className="space-y-2">
                      <Label htmlFor="bulletin_precedent">Bulletin précédent</Label>
                      <Input
                        id="bulletin_precedent"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('bulletin_precedent', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, PNG, Max 5MB
                      </p>
                    </div>

                    {/* Certificat médical */}
                    <div className="space-y-2">
                      <Label htmlFor="certificat_medical">Certificat médical</Label>
                      <Input
                        id="certificat_medical"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('certificat_medical', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, PNG, Max 5MB
                      </p>
                    </div>

                    {/* Autorisation parentale */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="autorisation_parentale">Autorisation parentale</Label>
                      <Input
                        id="autorisation_parentale"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('autorisation_parentale', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: PDF, JPG, PNG, Max 5MB
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation entre onglets */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {['identite', 'parents', 'scolarite', 'sante', 'documents'].map((tab, index) => (
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
                  <Button type="submit" disabled={processing || !data.classe_id}>
                    {processing ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Inscrire l'élève
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}