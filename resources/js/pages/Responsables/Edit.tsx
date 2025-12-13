import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Home,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  DollarSign,
  GraduationCap,
  Heart,
  Shield,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
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

interface ResponsableEditProps {
  responsable: {
    id: number;
    nom: string;
    prenom: string;
    type_responsable: string;
    cin: string | null;
    date_naissance: string | null;
    lieu_naissance: string | null;
    sexe: 'M' | 'F';
    profession: string | null;
    entreprise: string | null;
    poste: string | null;
    revenu_mensuel: number | null;
    adresse: string | null;
    ville: string | null;
    pays: string;
    telephone_1: string;
    telephone_2: string | null;
    email: string | null;
    situation_matrimoniale: string | null;
    niveau_etude: string | null;
    observations: string | null;
    ref: string;
    created_at: string;
    updated_at: string;
    eleves_count?: number;
  };
  typesResponsable: TypeResponsable[];
  situationsMatrimoniales: SituationMatrimoniale[];
  niveauxEtude: Array<{value: string, label: string}>;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ResponsableEdit({
  responsable,
  typesResponsable,
  situationsMatrimoniales,
  niveauxEtude,
  flash,
}: ResponsableEditProps) {
  const { data, setData, put, processing, errors, reset } = useForm({
    // Identité
    nom: responsable.nom,
    prenom: responsable.prenom,
    type_responsable: responsable.type_responsable,
    cin: responsable.cin || '',
    date_naissance: responsable.date_naissance || '',
    lieu_naissance: responsable.lieu_naissance || '',
    sexe: responsable.sexe,

    // Profession
    profession: responsable.profession || '',
    entreprise: responsable.entreprise || '',
    poste: responsable.poste || '',
    revenu_mensuel: responsable.revenu_mensuel || '',

    // Coordonnées
    adresse: responsable.adresse || '',
    ville: responsable.ville || '',
    pays: responsable.pays,
    telephone_1: responsable.telephone_1,
    telephone_2: responsable.telephone_2 || '',
    email: responsable.email || '',

    // Informations supplémentaires
    situation_matrimoniale: responsable.situation_matrimoniale || '',
    niveau_etude: responsable.niveau_etude || '',
    observations: responsable.observations || '',
  });

  const [activeTab, setActiveTab] = useState('identite');
  const [isChanged, setIsChanged] = useState(false);

  // Vérifier les changements
  useEffect(() => {
    const originalData = {
      nom: responsable.nom,
      prenom: responsable.prenom,
      type_responsable: responsable.type_responsable,
      cin: responsable.cin || '',
      date_naissance: responsable.date_naissance || '',
      lieu_naissance: responsable.lieu_naissance || '',
      sexe: responsable.sexe,
      profession: responsable.profession || '',
      entreprise: responsable.entreprise || '',
      poste: responsable.poste || '',
      revenu_mensuel: responsable.revenu_mensuel || '',
      adresse: responsable.adresse || '',
      ville: responsable.ville || '',
      pays: responsable.pays,
      telephone_1: responsable.telephone_1,
      telephone_2: responsable.telephone_2 || '',
      email: responsable.email || '',
      situation_matrimoniale: responsable.situation_matrimoniale || '',
      niveau_etude: responsable.niveau_etude || '',
      observations: responsable.observations || '',
    };

    const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
    setIsChanged(hasChanges);
  }, [data, responsable]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/responsables/${responsable.id}`);
  };

  const handleReset = () => {
    if (confirm('Voulez-vous annuler les modifications ?')) {
      reset();
      setIsChanged(false);
    }
  };

  const getTypeResponsableLabel = (type: string) => {
    const typeObj = typesResponsable.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const getSituationMatrimonialeLabel = (situation: string) => {
    const situationObj = situationsMatrimoniales.find(s => s.value === situation);
    return situationObj?.label || situation;
  };

  const getNiveauEtudeLabel = (niveau: string) => {
    const niveauObj = niveauxEtude.find(n => n.value === niveau);
    return niveauObj?.label || niveau;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <Head title={`Modifier ${responsable.nom} ${responsable.prenom}`} />
      
      <DashboardLayout activeRoute="/responsables">
        <PageHeader
          title={`Modifier le responsable`}
          description={responsable.nom + ' ' + responsable.prenom}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Responsables', href: '/responsables' },
            { label: `${responsable.nom} ${responsable.prenom}`, href: `/responsables/${responsable.id}` },
            { label: 'Modifier', href: `/responsables/${responsable.id}/edit` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/responsables/${responsable.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Button
                type="submit"
                form="responsable-form"
                disabled={processing || !isChanged}
              >
                {processing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!isChanged || processing}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          }
        />

        {flash?.success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Formulaire de modification
            </CardTitle>
            <CardDescription>
              Modifiez les informations du responsable. Référence : {responsable.ref}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="responsable-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur généraux */}
              {(errors.nom || errors.prenom || errors.telephone_1) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.nom || errors.prenom || errors.telephone_1}
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
                      <Label htmlFor="cin">Numéro CIN</Label>
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
                          value={formatDate(data.date_naissance)}
                          onChange={e => setData('date_naissance', e.target.value)}
                          className="pl-10"
                        />
                      </div>
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
                          placeholder="+1 234 567 8900"
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
                          placeholder="+1 234 567 8901"
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

                  {/* Informations système */}
                  <div className="pt-6 border-t">
                    <h3 className="text-sm font-medium mb-4">Informations système</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Référence unique</p>
                        <p className="font-mono text-sm">{responsable.ref}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Date de création</p>
                        <p className="text-sm">
                          {new Date(responsable.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Dernière modification</p>
                        <p className="text-sm">
                          {new Date(responsable.updated_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {responsable.eleves_count !== undefined && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Élèves associés</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {responsable.eleves_count} élève(s)
                            </Badge>
                            <Link href={`/responsables/${responsable.id}/eleves`}>
                              <Button variant="ghost" size="sm">
                                Gérer
                              </Button>
                            </Link>
                          </div>
                        </div>
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
                  <Link href={`/responsables/${responsable.id}`}>
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={processing || !isChanged}
                    form="responsable-form"
                  >
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
      </DashboardLayout>
    </>
  );
}