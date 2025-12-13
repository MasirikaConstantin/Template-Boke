import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  Home,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  DollarSign,
  Shield,
  Save,
  AlertCircle,
  User,
  FileText,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface TypeResponsable {
  value: string;
  label: string;
}

interface SituationMatrimoniale {
  value: string;
  label: string;
}

interface NiveauEtude {
  value: string;
  label: string;
}

interface ResponsableCreateProps {
  typesResponsable: TypeResponsable[];
  situationsMatrimoniales: SituationMatrimoniale[];
  niveauxEtude: NiveauEtude[];
}

export default function ResponsableCreate({
  typesResponsable,
  situationsMatrimoniales,
  niveauxEtude,
}: ResponsableCreateProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    // Identité
    nom: '',
    prenom: '',
    type_responsable: 'tuteur',
    cin: '',
    date_naissance: '',
    lieu_naissance: '',
    sexe: 'M' as 'M' | 'F',

    // Profession
    profession: '',
    entreprise: '',
    poste: '',
    revenu_mensuel: '',

    // Coordonnées
    adresse: '',
    ville: '',
    pays: 'RDC',
    telephone_1: '',
    telephone_2: '',
    email: '',

    // Informations supplémentaires
    situation_matrimoniale: '',
    niveau_etude: '',
    observations: '',
  });

  const [activeTab, setActiveTab] = useState('identite');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/responsables');
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

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser le formulaire ?')) {
      reset();
    }
  };

  return (
    <>
      <Head title="Créer un nouveau responsable" />
      
      <DashboardLayout activeRoute="/responsables">
        <PageHeader
          title="Créer un nouveau responsable"
          description="Remplissez le formulaire pour ajouter un nouveau responsable"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Responsables', href: '/responsables' },
            { label: 'Créer', href: '/responsables/create' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/responsables">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Button
                type="submit"
                form="responsable-form"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer le responsable
                  </>
                )}
              </Button>
            </div>
          }
        />

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Formulaire de création
            </CardTitle>
            <CardDescription>
              Tous les champs marqués d'un astérisque (*) sont obligatoires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="responsable-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur généraux */}
              {(errors.nom || errors.prenom || errors.telephone_1) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Veuillez remplir les champs obligatoires
                  </AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="identite" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Identité
                  </TabsTrigger>
                  <TabsTrigger value="profession" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Profession
                  </TabsTrigger>
                  <TabsTrigger value="coordonnees" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Coordonnées
                  </TabsTrigger>
                  <TabsTrigger value="informations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informations
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

                    {/* Type de responsable */}
                    <div className="space-y-2">
                      <Label htmlFor="type_responsable">Type de responsable *</Label>
                      <Select
                        value={data.type_responsable}
                        onValueChange={value => setData('type_responsable', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typesResponsable.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type_responsable && (
                        <p className="text-sm text-destructive">{errors.type_responsable}</p>
                      )}
                    </div>

                    {/* CIN */}
                    <div className="space-y-2">
                      <Label htmlFor="cin">Numéro Carte d'Identité National</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cin"
                          value={data.cin}
                          onChange={e => setData('cin', e.target.value)}
                          placeholder="A1234567"
                          className="pl-10"
                        />
                      </div>
                      {errors.cin && (
                        <p className="text-sm text-destructive">{errors.cin}</p>
                      )}
                    </div>

                    {/* Date de naissance */}
                    <div className="space-y-2">
                      <Label htmlFor="date_naissance">Date de naissance</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date_naissance"
                          type="date"
                          value={data.date_naissance}
                          onChange={e => setData('date_naissance', e.target.value)}
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

                    {/* Lieu de naissance */}
                    <div className="space-y-2">
                      <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lieu_naissance"
                          value={data.lieu_naissance}
                          onChange={e => setData('lieu_naissance', e.target.value)}
                          placeholder="Paris, France"
                          className="pl-10"
                        />
                      </div>
                      {errors.lieu_naissance && (
                        <p className="text-sm text-destructive">{errors.lieu_naissance}</p>
                      )}
                    </div>

                    {/* Sexe */}
                    <div className="space-y-2">
                      <Label htmlFor="sexe">Sexe *</Label>
                      <Select
                        value={data.sexe}
                        onValueChange={value => setData('sexe', value as 'M' | 'F')}
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
                  </div>
                </TabsContent>

                {/* Onglet Profession */}
                <TabsContent value="profession" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profession */}
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="profession"
                          value={data.profession}
                          onChange={e => setData('profession', e.target.value)}
                          placeholder="Ingénieur, Médecin, Enseignant..."
                          className="pl-10"
                        />
                      </div>
                      {errors.profession && (
                        <p className="text-sm text-destructive">{errors.profession}</p>
                      )}
                    </div>

                    {/* Entreprise */}
                    <div className="space-y-2">
                      <Label htmlFor="entreprise">Entreprise</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="entreprise"
                          value={data.entreprise}
                          onChange={e => setData('entreprise', e.target.value)}
                          placeholder="Nom de l'entreprise"
                          className="pl-10"
                        />
                      </div>
                      {errors.entreprise && (
                        <p className="text-sm text-destructive">{errors.entreprise}</p>
                      )}
                    </div>

                    {/* Poste */}
                    <div className="space-y-2">
                      <Label htmlFor="poste">Poste occupé</Label>
                      <Input
                        id="poste"
                        value={data.poste}
                        onChange={e => setData('poste', e.target.value)}
                        placeholder="Directeur, Cadre, Employé..."
                      />
                      {errors.poste && (
                        <p className="text-sm text-destructive">{errors.poste}</p>
                      )}
                    </div>

                    {/* Revenu mensuel */}
                    <div className="space-y-2">
                      <Label htmlFor="revenu_mensuel">Revenu mensuel (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="revenu_mensuel"
                          type="number"
                          min="0"
                          step="0.01"
                          value={data.revenu_mensuel}
                          onChange={e => setData('revenu_mensuel', e.target.value)}
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                      {errors.revenu_mensuel && (
                        <p className="text-sm text-destructive">{errors.revenu_mensuel}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Coordonnées */}
                <TabsContent value="coordonnees" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Téléphone principal */}
                    <div className="space-y-2">
                      <Label htmlFor="telephone_1">Téléphone principal *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="telephone_1"
                          value={data.telephone_1}
                          onChange={e => setData('telephone_1', e.target.value)}
                          placeholder="+243 81 234 5678"
                          required
                          className="pl-10"
                        />
                      </div>
                      {errors.telephone_1 && (
                        <p className="text-sm text-destructive">{errors.telephone_1}</p>
                      )}
                    </div>

                    {/* Téléphone secondaire */}
                    <div className="space-y-2">
                      <Label htmlFor="telephone_2">Téléphone secondaire</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="telephone_2"
                          value={data.telephone_2}
                          onChange={e => setData('telephone_2', e.target.value)}
                          placeholder="+243 82 345 6789"
                          className="pl-10"
                        />
                      </div>
                      {errors.telephone_2 && (
                        <p className="text-sm text-destructive">{errors.telephone_2}</p>
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
                          placeholder="jean.dupont@example.com"
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    {/* Pays */}
                    <div className="space-y-2">
                      <Label htmlFor="pays">Pays *</Label>
                      <Input
                        id="pays"
                        value={data.pays}
                        onChange={e => setData('pays', e.target.value)}
                        placeholder="République Démocratique du Congo"
                        required
                      />
                      {errors.pays && (
                        <p className="text-sm text-destructive">{errors.pays}</p>
                      )}
                    </div>

                    {/* Ville */}
                    <div className="space-y-2">
                      <Label htmlFor="ville">Ville</Label>
                      <Input
                        id="ville"
                        value={data.ville}
                        onChange={e => setData('ville', e.target.value)}
                        placeholder="Kinshasa"
                      />
                      {errors.ville && (
                        <p className="text-sm text-destructive">{errors.ville}</p>
                      )}
                    </div>

                    {/* Adresse */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse">Adresse complète</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="adresse"
                          value={data.adresse}
                          onChange={e => setData('adresse', e.target.value)}
                          placeholder="Avenue, Numéro, Quartier, Commune..."
                          className="pl-10"
                          rows={3}
                        />
                      </div>
                      {errors.adresse && (
                        <p className="text-sm text-destructive">{errors.adresse}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Informations */}
                <TabsContent value="informations" className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Situation matrimoniale */}
                    <div className="space-y-2">
                      <Label htmlFor="situation_matrimoniale">Situation matrimoniale</Label>
                      <Select
                        value={data.situation_matrimoniale}
                        onValueChange={value => setData('situation_matrimoniale', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {situationsMatrimoniales.map((situation) => (
                            <SelectItem key={situation.value} value={situation.value}>
                              {situation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.situation_matrimoniale && (
                        <p className="text-sm text-destructive">{errors.situation_matrimoniale}</p>
                      )}
                    </div>

                    {/* Niveau d'étude */}
                    <div className="space-y-2">
                      <Label htmlFor="niveau_etude">Niveau d'étude</Label>
                      <Select
                        value={data.niveau_etude}
                        onValueChange={value => setData('niveau_etude', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {niveauxEtude.map((niveau) => (
                            <SelectItem key={niveau.value} value={niveau.value}>
                              {niveau.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.niveau_etude && (
                        <p className="text-sm text-destructive">{errors.niveau_etude}</p>
                      )}
                    </div>

                    {/* Observations */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="observations">Observations</Label>
                      <Textarea
                        id="observations"
                        value={data.observations}
                        onChange={e => setData('observations', e.target.value)}
                        placeholder="Informations supplémentaires, remarques..."
                        rows={4}
                      />
                      {errors.observations && (
                        <p className="text-sm text-destructive">{errors.observations}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation entre onglets */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {['identite', 'profession', 'coordonnees', 'informations'].map((tab, index) => (
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                  >
                    Réinitialiser
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Créer le responsable
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