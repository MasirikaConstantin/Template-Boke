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
  Trash2,
  Plus,
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


interface Classe {
  id: number;
  nom_classe: string;
  niveau: string;
  section?: string;
  code_classe?: string;
}

interface Nationalite {
  value: string;
  label: string;
}



interface ResponsableForm {
  nom: string;
  prenom: string;
  type_responsable: 'pere' | 'mere' | 'tuteur' | 'autre';
  telephone_1: string;
  email: string;
  profession: string;
  adresse: string;
}

export default function CreateEleve({ classes, nationalites }: CreateEleveProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    // Identité
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: 'M' as 'M' | 'F',
    lieu_naissance: '',
    nationalite: 'Congolaise RDC',
    adresse: '',
    telephone: '',
    email: '',
    
    // Responsables
    responsables: [] as ResponsableForm[],
    
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
    moyen_transport: 'marche' as 'marche' | 'bus' | 'voiture' | 'taxi' | 'autre',
    nom_transporteur: '',
    telephone_transporteur: '',
    
    // Observations
    observations: '',
    
    // Documents
    photo: null as File | null,
    certificat_naissance: null as File | null,
    bulletin_precedent: null as File | null,
    certificat_medical: null as File | null,
    autorisation_parentale: null as File | null,
  });

  const [activeTab, setActiveTab] = useState('identite');

  // Ajouter un responsable
  const addResponsable = () => {
    setData('responsables', [
      ...data.responsables,
      {
        nom: '',
        prenom: '',
        type_responsable: 'tuteur',
        telephone_1: '',
        email: '',
        profession: '',
        adresse: '',
      },
    ]);
  };
 const handleFileChange = (field: string, file: File | null) => {
    setData(field as any, file);
  };
  const niveauxTransport = [
    { value: 'marche', label: 'À pied' },
    { value: 'bus', label: 'Bus scolaire' },
    { value: 'voiture', label: 'Voiture personnelle' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'autre', label: 'Autre' },
  ];
  // Supprimer un responsable
  const removeResponsable = (index: number) => {
    const updated = [...data.responsables];
    updated.splice(index, 1);
    setData('responsables', updated);
  };

  // Mettre à jour un responsable
  const updateResponsable = (index: number, field: keyof ResponsableForm, value: string) => {
    const updated = [...data.responsables];
    updated[index] = { ...updated[index], [field]: value };
    setData('responsables', updated);
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value);
    } 
    else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    }
    else if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0');
    }
    else {
      formData.append(key, String(value));
    }
  });

  post('/eleves', {
    data: formData,
  });
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

  const typesResponsable = [
    { value: 'pere', label: 'Père' },
    { value: 'mere', label: 'Mère' },
    { value: 'tuteur', label: 'Tuteur' },
    { value: 'autre', label: 'Autre' },
  ];

  const moyensTransport = [
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
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Veuillez corriger les erreurs dans le formulaire
                  </AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="identite" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Identité
                  </TabsTrigger>
                  <TabsTrigger value="responsables" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Responsables
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
                      {errors.nom && <p className="text-sm text-destructive">{errors.nom}</p>}
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
                      {errors.prenom && <p className="text-sm text-destructive">{errors.prenom}</p>}
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
                        <p className="text-sm text-muted-foreground">Âge: {calculateAge()} ans</p>
                      )}
                      {errors.date_naissance && <p className="text-sm text-destructive">{errors.date_naissance}</p>}
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
                            onChange={e => setData('sexe', e.target.value as 'M' | 'F')}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="sexe_m" className="flex items-center gap-2">
                            <span>👦</span> Masculin
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="sexe_f"
                            name="sexe"
                            value="F"
                            checked={data.sexe === 'F'}
                            onChange={e => setData('sexe', e.target.value as 'M' | 'F')}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="sexe_f" className="flex items-center gap-2">
                            <span>👧</span> Féminin
                          </Label>
                        </div>
                      </div>
                      {errors.sexe && <p className="text-sm text-destructive">{errors.sexe}</p>}
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
                      {errors.lieu_naissance && <p className="text-sm text-destructive">{errors.lieu_naissance}</p>}
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
                            <SelectItem key={nationalite.value} value={nationalite.value}>
                              {nationalite.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.nationalite && <p className="text-sm text-destructive">{errors.nationalite}</p>}
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
                      {errors.adresse && <p className="text-sm text-destructive">{errors.adresse}</p>}
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
                      {errors.telephone && <p className="text-sm text-destructive">{errors.telephone}</p>}
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
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Responsables */}
                <TabsContent value="responsables" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Responsables légaux</Label>
                      <Button type="button" onClick={addResponsable} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un responsable
                      </Button>
                    </div>
                    
                    {data.responsables.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Aucun responsable ajouté</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Cliquez sur "Ajouter un responsable" pour commencer
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.responsables.map((responsable, index) => (
                          <Card key={index} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">
                                  Responsable {index + 1}
                                  {index === 0 && (
                                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                      Principal
                                    </span>
                                  )}
                                </CardTitle>
                                <Button
                                  type="button"
                                  onClick={() => removeResponsable(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Type de responsable */}
                                <div className="space-y-2">
                                  <Label>Type de responsable</Label>
                                  <Select
                                    value={responsable.type_responsable}
                                    onValueChange={(value) => updateResponsable(index, 'type_responsable', value as any)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {typesResponsable.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Nom */}
                                <div className="space-y-2">
                                  <Label>Nom *</Label>
                                  <Input
                                    value={responsable.nom}
                                    onChange={(e) => updateResponsable(index, 'nom', e.target.value)}
                                    placeholder="Nom"
                                    required
                                  />
                                </div>

                                {/* Prénom */}
                                <div className="space-y-2">
                                  <Label>Prénom *</Label>
                                  <Input
                                    value={responsable.prenom}
                                    onChange={(e) => updateResponsable(index, 'prenom', e.target.value)}
                                    placeholder="Prénom"
                                    required
                                  />
                                </div>

                                {/* Téléphone */}
                                <div className="space-y-2">
                                  <Label>Téléphone *</Label>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      value={responsable.telephone_1}
                                      onChange={(e) => updateResponsable(index, 'telephone_1', e.target.value)}
                                      placeholder="77 123 45 67"
                                      required
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="email"
                                      value={responsable.email}
                                      onChange={(e) => updateResponsable(index, 'email', e.target.value)}
                                      placeholder="email@exemple.com"
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                {/* Profession */}
                                <div className="space-y-2">
                                  <Label>Profession</Label>
                                  <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      value={responsable.profession}
                                      onChange={(e) => updateResponsable(index, 'profession', e.target.value)}
                                      placeholder="Profession"
                                      className="pl-10"
                                    />
                                  </div>
                                </div>

                                {/* Adresse */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label>Adresse</Label>
                                  <Textarea
                                    value={responsable.adresse}
                                    onChange={(e) => updateResponsable(index, 'adresse', e.target.value)}
                                    placeholder="Adresse complète"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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

              {/* Navigation et boutons d'action */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {['identite', 'responsables', 'scolarite', 'sante', 'documents'].map((tab, index) => (
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