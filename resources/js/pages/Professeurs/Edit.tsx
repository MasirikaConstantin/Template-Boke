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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
    Shield,
    Save,
    X,
    GraduationCap,
    Award,
    School,
    BookOpen,
    FileText,
    CheckCircle,
    AlertCircle,
    UserPlus,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Professeur {
    id: number;
    nom: string;
    prenom: string;
    date_naissance: string | null;
    sexe: 'M' | 'F';
    lieu_naissance: string | null;
    nationalite: string;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    photo: string | null;

    statut: string;
    type_contrat: string;
    date_embauche: string;
    date_fin_contrat: string | null;
    salaire_base: number | null;
    numero_cnss: string | null;
    numero_compte_bancaire: string | null;
    nom_banque: string | null;

    niveau_etude: string;
    diplome: string | null;
    specialite: string | null;
    etablissement: string | null;
    annee_obtention: number | null;

    classe_id: string | null;
    ref: string;
    created_at: string;
    updated_at: string;
}

interface ProfesseurEditProps {
    professeur: Professeur;
    classes: Array<{ id: number; nom_classe: string; niveau: string }>;
    matieres: Array<{ id: number; nom: string; coefficient: number }>;
    matieresSelectionnees: number[];
    statuts: Array<{ value: string; label: string }>;
    typesContrat: Array<{ value: string; label: string }>;
    niveauxEtude: Array<{ value: string; label: string }>;
    sexes: Array<{ value: string; label: string }>;
}

export default function ProfesseurEdit({
    professeur,
    classes,
    matieres,
    matieresSelectionnees,
    statuts,
    typesContrat,
    niveauxEtude,
    sexes,
}: ProfesseurEditProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        // Identité
        nom: professeur.nom,
        prenom: professeur.prenom,
        date_naissance: professeur.date_naissance || '',
        sexe: professeur.sexe,
        lieu_naissance: professeur.lieu_naissance || '',
        nationalite: professeur.nationalite,
        adresse: professeur.adresse || '',
        telephone: professeur.telephone || '',
        email: professeur.email || '',

        // Profession
        statut: professeur.statut,
        type_contrat: professeur.type_contrat,
        date_embauche: professeur.date_embauche,
        date_fin_contrat: professeur.date_fin_contrat || '',
        salaire_base: professeur.salaire_base || '',
        numero_cnss: professeur.numero_cnss || '',
        numero_compte_bancaire: professeur.numero_compte_bancaire || '',
        nom_banque: professeur.nom_banque || '',

        // Qualifications
        niveau_etude: professeur.niveau_etude,
        diplome: professeur.diplome || '',
        specialite: professeur.specialite || '',
        etablissement: professeur.etablissement || '',
        annee_obtention: professeur.annee_obtention || '',

        // Matières et classes
        matieres: matieresSelectionnees,
        classe_id: professeur.classe_id || '',

        // Documents (fichiers)
        photo: null as File | null,
        cv: null as File | null,
        diplome_copie: null as File | null,
        contrat: null as File | null,
    });

    const [activeTab, setActiveTab] = useState('identite');
    const [isChanged, setIsChanged] = useState(false);
    const [matiereSearch, setMatiereSearch] = useState('');

    // Vérifier les changements
    useEffect(() => {
        const originalData = {
            nom: professeur.nom,
            prenom: professeur.prenom,
            date_naissance: professeur.date_naissance || '',
            sexe: professeur.sexe,
            lieu_naissance: professeur.lieu_naissance || '',
            nationalite: professeur.nationalite,
            adresse: professeur.adresse || '',
            telephone: professeur.telephone || '',
            email: professeur.email || '',
            statut: professeur.statut,
            type_contrat: professeur.type_contrat,
            date_embauche: professeur.date_embauche,
            date_fin_contrat: professeur.date_fin_contrat || '',
            salaire_base: professeur.salaire_base || '',
            numero_cnss: professeur.numero_cnss || '',
            numero_compte_bancaire: professeur.numero_compte_bancaire || '',
            nom_banque: professeur.nom_banque || '',
            niveau_etude: professeur.niveau_etude,
            diplome: professeur.diplome || '',
            specialite: professeur.specialite || '',
            etablissement: professeur.etablissement || '',
            annee_obtention: professeur.annee_obtention || '',
            matieres: matieresSelectionnees,
            classe_id: professeur.classe_id || '',
        };

        const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
        setIsChanged(hasChanges);
    }, [data, professeur, matieresSelectionnees]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        // Ajouter tous les champs textuels
        Object.keys(data).forEach(key => {
            if (!['photo', 'cv', 'diplome_copie', 'contrat'].includes(key)) {
                const value = (data as any)[key];
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            }
        });

        // Ajouter les fichiers si présents
        if (data.photo) formData.append('photo', data.photo);
        if (data.cv) formData.append('cv', data.cv);
        if (data.diplome_copie) formData.append('diplome_copie', data.diplome_copie);
        if (data.contrat) formData.append('contrat', data.contrat);

        put(`/professeurs/${professeur.id}`, {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    };
    const calculateAnciennete = () => {
    if (!data.date_embauche) return null;
    const embauche = new Date(data.date_embauche);
    const today = new Date();
    let annees = today.getFullYear() - embauche.getFullYear();
    const monthDiff = today.getMonth() - embauche.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < embauche.getDate())) {
      annees--;
    }
    return annees;
  };

    const handleReset = () => {
        if (confirm('Voulez-vous annuler les modifications ?')) {
            reset();
            setIsChanged(false);
        }
    };

    const toggleMatiere = (matiereId: number) => {
        const newMatieres = data.matieres.includes(matiereId)
            ? data.matieres.filter(id => id !== matiereId)
            : [...data.matieres, matiereId];
        setData('matieres', newMatieres);
    };

    const filteredMatieres = matieres.filter(matiere =>
        matiere.nom.toLowerCase().includes(matiereSearch.toLowerCase())
    );

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

    return (
        <>
            <Head title={`Modifier ${professeur.nom} ${professeur.prenom}`} />

            <DashboardLayout activeRoute="/professeurs">
                <PageHeader
                    title={`Modifier le professeur`}
                    description={professeur.nom + ' ' + professeur.prenom}
                    breadcrumb={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Professeurs', href: '/professeurs' },
                        { label: `${professeur.nom} ${professeur.prenom}`, href: `/professeurs/${professeur.id}` },
                        { label: 'Modifier', href: `/professeurs/${professeur.id}/edit` },
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href={`/professeurs/${professeur.id}`}>
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                form="professeur-form"
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

                <Card className="max-w-6xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Formulaire de modification
                        </CardTitle>
                        <CardDescription>
                            Modifiez les informations du professeur. Référence : {professeur.ref}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="professeur-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Messages d'erreur généraux */}
                            {(errors.nom || errors.prenom || errors.date_embauche) && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {errors.nom || errors.prenom || errors.date_embauche}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="identite" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Identité
                                    </TabsTrigger>
                                    <TabsTrigger value="profession" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Profession
                                    </TabsTrigger>
                                    <TabsTrigger value="qualifications" className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Qualifications
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
                                            {errors.date_naissance && <p className="text-sm text-destructive">{errors.date_naissance}</p>}
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
                                                    {sexes.map((sexe) => (
                                                        <SelectItem key={sexe.value} value={sexe.value}>
                                                            {sexe.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                    placeholder="Kinshasa, RDC"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.lieu_naissance && <p className="text-sm text-destructive">{errors.lieu_naissance}</p>}
                                        </div>

                                        {/* Nationalité */}
                                        <div className="space-y-2">
                                            <Label htmlFor="nationalite">Nationalité *</Label>
                                            <Input
                                                id="nationalite"
                                                value={data.nationalite}
                                                onChange={e => setData('nationalite', e.target.value)}
                                                placeholder="Congolaise DRC"
                                                required
                                            />
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
                                                    placeholder="Avenue, Numéro, Quartier, Commune..."
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
                                                    placeholder="+243 81 234 5678"
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
                                                    placeholder="jean.dupont@example.com"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                        </div>

                                        {/* Photo */}
                                        <div className="space-y-2">
                                            <Label htmlFor="photo">Photo</Label>
                                            <Input
                                                id="photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Format: JPG, PNG, Max 2MB
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Onglet Profession */}
                                <TabsContent value="profession" className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Statut */}
                                        <div className="space-y-2">
                                            <Label htmlFor="statut">Statut *</Label>
                                            <Select
                                                value={data.statut}
                                                onValueChange={value => setData('statut', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuts.map((statut) => (
                                                        <SelectItem key={statut.value} value={statut.value}>
                                                            {statut.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.statut && <p className="text-sm text-destructive">{errors.statut}</p>}
                                        </div>

                                        {/* Type de contrat */}
                                        <div className="space-y-2">
                                            <Label htmlFor="type_contrat">Type de contrat *</Label>
                                            <Select
                                                value={data.type_contrat}
                                                onValueChange={value => setData('type_contrat', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {typesContrat.map((contrat) => (
                                                        <SelectItem key={contrat.value} value={contrat.value}>
                                                            {contrat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.type_contrat && <p className="text-sm text-destructive">{errors.type_contrat}</p>}
                                        </div>

                                        {/* Date d'embauche */}
                                        <div className="space-y-2">
                                            <Label htmlFor="date_embauche">Date d'embauche *</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="date_embauche"
                                                    type="date"
                                                    value={data.date_embauche}
                                                    onChange={e => setData('date_embauche', e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                            {data.date_embauche && (
                                                <p className="text-sm text-muted-foreground">
                                                    Ancienneté: {calculateAnciennete()} an(s)
                                                </p>
                                            )}
                                            {errors.date_embauche && <p className="text-sm text-destructive">{errors.date_embauche}</p>}
                                        </div>

                                        {/* Date fin contrat (pour CDD) */}
                                        {data.type_contrat === 'cdd' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="date_fin_contrat">Date de fin de contrat</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="date_fin_contrat"
                                                        type="date"
                                                        value={data.date_fin_contrat}
                                                        onChange={e => setData('date_fin_contrat', e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                                {errors.date_fin_contrat && <p className="text-sm text-destructive">{errors.date_fin_contrat}</p>}
                                            </div>
                                        )}

                                        {/* Salaire de base */}
                                        <div className="space-y-2">
                                            <Label htmlFor="salaire_base">Salaire de base (USD)</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="salaire_base"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.salaire_base}
                                                    onChange={e => setData('salaire_base', e.target.value)}
                                                    placeholder="500.00"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.salaire_base && <p className="text-sm text-destructive">{errors.salaire_base}</p>}
                                        </div>

                                        {/* Numéro CNSS */}
                                        <div className="space-y-2">
                                            <Label htmlFor="numero_cnss">Numéro CNSS</Label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="numero_cnss"
                                                    value={data.numero_cnss}
                                                    onChange={e => setData('numero_cnss', e.target.value)}
                                                    placeholder="CNSS-12345678"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.numero_cnss && <p className="text-sm text-destructive">{errors.numero_cnss}</p>}
                                        </div>

                                        {/* Compte bancaire */}
                                        <div className="space-y-2">
                                            <Label htmlFor="numero_compte_bancaire">Numéro de compte bancaire</Label>
                                            <Input
                                                id="numero_compte_bancaire"
                                                value={data.numero_compte_bancaire}
                                                onChange={e => setData('numero_compte_bancaire', e.target.value)}
                                                placeholder="001-2345678-89"
                                            />
                                            {errors.numero_compte_bancaire && <p className="text-sm text-destructive">{errors.numero_compte_bancaire}</p>}
                                        </div>

                                        {/* Banque */}
                                        <div className="space-y-2">
                                            <Label htmlFor="nom_banque">Nom de la banque</Label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="nom_banque"
                                                    value={data.nom_banque}
                                                    onChange={e => setData('nom_banque', e.target.value)}
                                                    placeholder="Banque Centrale du Congo"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.nom_banque && <p className="text-sm text-destructive">{errors.nom_banque}</p>}
                                        </div>

                                        {/* Documents */}
                                        <div className="space-y-4 md:col-span-2">
                                            <h3 className="text-sm font-medium">Documents professionnels</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="cv">CV</Label>
                                                    <Input
                                                        id="cv"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => setData('cv', e.target.files?.[0] || null)}
                                                        className="cursor-pointer"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Format: PDF, DOC, Max 5MB
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="contrat">Contrat de travail</Label>
                                                    <Input
                                                        id="contrat"
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) => setData('contrat', e.target.files?.[0] || null)}
                                                        className="cursor-pointer"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Format: PDF, Max 5MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Onglet Qualifications */}
                                <TabsContent value="qualifications" className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Niveau d'étude */}
                                        <div className="space-y-2">
                                            <Label htmlFor="niveau_etude">Niveau d'étude *</Label>
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
                                            {errors.niveau_etude && <p className="text-sm text-destructive">{errors.niveau_etude}</p>}
                                        </div>

                                        {/* Diplôme */}
                                        <div className="space-y-2">
                                            <Label htmlFor="diplome">Diplôme obtenu</Label>
                                            <div className="relative">
                                                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="diplome"
                                                    value={data.diplome}
                                                    onChange={e => setData('diplome', e.target.value)}
                                                    placeholder="Licence en Mathématiques"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.diplome && <p className="text-sm text-destructive">{errors.diplome}</p>}
                                        </div>

                                        {/* Spécialité */}
                                        <div className="space-y-2">
                                            <Label htmlFor="specialite">Spécialité</Label>
                                            <Input
                                                id="specialite"
                                                value={data.specialite}
                                                onChange={e => setData('specialite', e.target.value)}
                                                placeholder="Mathématiques Appliquées"
                                            />
                                            {errors.specialite && <p className="text-sm text-destructive">{errors.specialite}</p>}
                                        </div>

                                        {/* Établissement */}
                                        <div className="space-y-2">
                                            <Label htmlFor="etablissement">Établissement</Label>
                                            <div className="relative">
                                                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="etablissement"
                                                    value={data.etablissement}
                                                    onChange={e => setData('etablissement', e.target.value)}
                                                    placeholder="Université de Kinshasa"
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.etablissement && <p className="text-sm text-destructive">{errors.etablissement}</p>}
                                        </div>

                                        {/* Année d'obtention */}
                                        <div className="space-y-2">
                                            <Label htmlFor="annee_obtention">Année d'obtention</Label>
                                            <Input
                                                id="annee_obtention"
                                                type="number"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                value={data.annee_obtention}
                                                onChange={e => setData('annee_obtention', e.target.value)}
                                                placeholder="2020"
                                            />
                                            {errors.annee_obtention && <p className="text-sm text-destructive">{errors.annee_obtention}</p>}
                                        </div>

                                        {/* Copie du diplôme */}
                                        <div className="space-y-2">
                                            <Label htmlFor="diplome_copie">Copie du diplôme</Label>
                                            <Input
                                                id="diplome_copie"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('diplome_copie', e.target.files?.[0] || null)}
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
                                    {['identite', 'profession', 'qualifications'].map((tab, index) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-3 py-1 text-sm rounded-full ${activeTab === tab
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
                                                Modification en cours...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Modifier le professeur
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