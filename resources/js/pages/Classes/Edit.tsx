import React, { useState, useEffect } from 'react';
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
import {
  ArrowLeft,
  School,
  AlertCircle,
  Users,
  Save,
  Eye,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Professeur {
  id: number;
  name: string;
  email: string;
}

interface EditClasseProps {
  classe: {
    id: number;
    nom_classe: string;
    niveau: 'primaire' | 'secondaire';
    section: string | null;
    professeur_principal_id: number | null;
    capacite_max: number;
    nombre_eleves: number;
    statut: 'active' | 'inactive' | 'archived';
    description: string | null;
    ref: string;
    created_at: string;
    updated_at: string;
  };
  professeurs: Professeur[];
  sections: Record<string, string>;
}

export default function EditClasse({ classe, professeurs, sections }: EditClasseProps) {
  const { data, setData, put, processing, errors, reset } = useForm({
    nom_classe: classe.nom_classe,
    niveau: classe.niveau,
    section: classe.section || '',
    professeur_principal_id: classe.professeur_principal_id || '',
    capacite_max: classe.capacite_max,
    statut: classe.statut,
    description: classe.description || '',
  });

  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');

  // Avertissement si on essaie d'archiver une classe avec des élèves
  useEffect(() => {
    if (data.statut === 'archived' && classe.nombre_eleves > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [data.statut, classe.nombre_eleves]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showWarning) {
      if (!confirm('Cette classe contient des élèves. Voulez-vous vraiment l\'archiver ? Les élèves devront être réaffectés.')) {
        return;
      }
    }
    
    put(`/classes/${classe.id}`);
  };

  const getNomComplet = () => {
    if (data.niveau === 'secondaire' && data.section) {
      return `${data.nom_classe} ${data.section}`;
    }
    return data.nom_classe;
  };

  const niveaux = [
    { value: 'primaire', label: 'Primaire', icon: '📚' },
    { value: 'secondaire', label: 'Secondaire', icon: '🎓' },
  ];

  const statuts = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'warning' },
    { value: 'archived', label: 'Archivée', color: 'secondary' },
  ];

  const getStatutColor = (statut: string) => {
    const statutObj = statuts.find(s => s.value === statut);
    return statutObj?.color || 'default';
  };
console.log(classe)
  return (
    <>
      <Head title={`Modifier ${classe.nom_classe}`} />
      
      <DashboardLayout activeRoute="/classes">
        <PageHeader
          title={`Modifier ${classe.nom_classe}`}
          description={`Référence: ${classe.ref}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/classes' },
            { label: 'Modifier', href: `/classes/${classe.id}/edit` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/classes/${classe.id}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir
                </Button>
              </Link>
              <Link href="/classes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de la classe */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Modifier la classe
                </CardTitle>
                <CardDescription>
                  Modifiez les informations de la classe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avertissement d'archivage */}
                  {showWarning && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Cette classe contient {classe.nombre_eleves} élève(s). 
                        Vous ne pouvez pas archiver une classe contenant des élèves.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Messages d'erreur généraux */}
                  {errors.nom_classe && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.nom_classe}</AlertDescription>
                    </Alert>
                  )}

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="infos" className="flex items-center gap-2">
                        Informations
                      </TabsTrigger>
                      <TabsTrigger value="configuration" className="flex items-center gap-2">
                        Configuration
                      </TabsTrigger>
                      <TabsTrigger value="statut" className="flex items-center gap-2">
                        Statut
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="infos" className="space-y-6 pt-6">
                      {/* Nom de la classe */}
                      <div className="space-y-2">
                        <Label htmlFor="nom_classe">Nom de la classe *</Label>
                        <Input
                          id="nom_classe"
                          value={data.nom_classe}
                          onChange={e => setData('nom_classe', e.target.value)}
                          placeholder="Ex: 6ème A, Terminale S, CP..."
                          required
                          autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                          Nom complet: <span className="font-medium">{getNomComplet()}</span>
                        </p>
                        {errors.nom_classe && (
                          <p className="text-sm text-destructive">{errors.nom_classe}</p>
                        )}
                      </div>

                      {/* Niveau (non modifiable si des élèves existent) */}
                      <div className="space-y-2">
                        <Label>Niveau *</Label>
                        {classe.nombre_eleves > 0 ? (
                          <div className="space-y-2">
                            <Input
                              value={data.niveau === 'primaire' ? 'Primaire' : 'Secondaire'}
                              disabled
                              className="bg-muted"
                            />
                            <p className="text-xs text-amber-600">
                              Le niveau ne peut pas être modifié car la classe contient des élèves.
                            </p>
                            <input type="hidden" name="niveau" value={data.niveau} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            {niveaux.map((niveau) => (
                              <Card
                                key={niveau.value}
                                className={`cursor-pointer transition-all ${
                                  data.niveau === niveau.value
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'hover:border-border'
                                }`}
                                onClick={() => setData('niveau', niveau.value)}
                              >
                                <CardContent className="p-4 flex items-center gap-3">
                                  <div className="text-2xl">{niveau.icon}</div>
                                  <div>
                                    <p className="font-medium">{niveau.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {niveau.value === 'primaire' 
                                        ? 'CP au CM2' 
                                        : '6ème à Terminale'}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                        {errors.niveau && (
                          <p className="text-sm text-destructive">{errors.niveau}</p>
                        )}
                      </div>

                      {/* Section (seulement pour secondaire) */}
                      {data.niveau === 'secondaire' && (
                        <div className="space-y-2">
                          <Label htmlFor="section">Section *</Label>
                          <Select
                            value={data.section}
                            onValueChange={value => setData('section', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une section" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(sections).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            La section détermine la spécialité de la classe
                          </p>
                          {errors.section && (
                            <p className="text-sm text-destructive">{errors.section}</p>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="configuration" className="space-y-6 pt-6">
                      {/* Capacité maximale */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="capacite_max">Capacité maximale *</Label>
                          <span className="text-sm text-muted-foreground">
                            Actuellement: {classe.nombre_eleves} élève(s)
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            id="capacite_max"
                            type="number"
                            min={classe.nombre_eleves}
                            max="100"
                            value={data.capacite_max}
                            onChange={e => setData('capacite_max', parseInt(e.target.value) || 30)}
                            className="pl-10"
                          />
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Minimum: {classe.nombre_eleves} (nombre d'élèves actuels)
                          </span>
                          <span className="text-muted-foreground">
                            Maximum recommandé: 35
                          </span>
                        </div>
                        {data.capacite_max < classe.nombre_eleves && (
                          <Alert variant="destructive" className="py-2">
                            <AlertDescription className="text-xs">
                              La capacité ne peut pas être inférieure au nombre d'élèves actuels ({classe.nombre_eleves})
                            </AlertDescription>
                          </Alert>
                        )}
                        {errors.capacite_max && (
                          <p className="text-sm text-destructive">{errors.capacite_max}</p>
                        )}
                      </div>

                      {/* Professeur principal */}
                      <div className="space-y-2">
                        <Label htmlFor="professeur_principal_id">Professeur principal</Label>
                        <Select
                          value={data.professeur_principal_id?.toString() || ''}
                          onValueChange={value => setData('professeur_principal_id', value ? parseInt(value) : '')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un professeur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Aucun</SelectItem>
                            {professeurs.map((prof) => (
                              <SelectItem key={prof.id} value={prof.id.toString()}>
                                <div className="flex flex-col">
                                  <span>{prof.name}</span>
                                  <span className="text-xs text-muted-foreground">{prof.email}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Le professeur principal sera responsable de cette classe
                        </p>
                        {errors.professeur_principal_id && (
                          <p className="text-sm text-destructive">{errors.professeur_principal_id}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={data.description}
                          onChange={e => setData('description', e.target.value)}
                          placeholder="Informations supplémentaires sur la classe..."
                          rows={4}
                        />
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">
                            Optionnel - Maximum 500 caractères
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.description?.length || 0}/500
                          </p>
                        </div>
                        {errors.description && (
                          <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="statut" className="space-y-6 pt-6">
                      {/* Statut */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="statut">Statut de la classe *</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Détermine si la classe est active, inactive ou archivée
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {statuts.map((statut) => (
                            <Card
                              key={statut.value}
                              className={`cursor-pointer transition-all ${
                                data.statut === statut.value
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'hover:border-border'
                              }`}
                              onClick={() => {
                                if (statut.value === 'archived' && classe.nombre_eleves > 0) {
                                  if (confirm(`Cette classe contient ${classe.nombre_eleves} élève(s). Voulez-vous vraiment l'archiver ?`)) {
                                    setData('statut', statut.value);
                                  }
                                } else {
                                  setData('statut', statut.value);
                                }
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center gap-2">
                                  <Badge variant={statut.color as any} className="mb-2">
                                    {statut.label}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground">
                                    {statut.value === 'active' && 'La classe est active et peut recevoir des élèves'}
                                    {statut.value === 'inactive' && 'La classe est inactive (maintenance, etc.)'}
                                    {statut.value === 'archived' && 'La classe est archivée (historique)'}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {data.statut === 'archived' && classe.nombre_eleves > 0 && (
                          <Alert variant="warning">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <p className="font-medium mb-1">Attention !</p>
                              <p>
                                Cette classe contient {classe.nombre_eleves} élève(s). 
                                L'archivage n'est pas recommandé. Considérez plutôt :
                              </p>
                              <ul className="list-disc list-inside mt-2 text-sm">
                                <li>Transférer les élèves vers une autre classe</li>
                                <li>Attendre la fin de l'année scolaire</li>
                                <li>Utiliser le statut "inactive" temporairement</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {errors.statut && (
                          <Alert variant="destructive">
                            <AlertDescription>{errors.statut}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Boutons d'action */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Référence: <span className="font-mono">{classe.ref}</span></p>
                      <p>Créée le: {new Date(classe.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Link href="/classes">
                        <Button type="button" variant="outline">
                          Annuler
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing || (data.capacite_max < classe.nombre_eleves)}>
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

          {/* Panneau latéral avec informations */}
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom actuel</p>
                    <p className="font-medium">{classe.nom_classe}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Niveau actuel</p>
                    <Badge variant={classe.niveau === 'primaire' ? 'default' : 'secondary'}>
                      {classe.niveau === 'primaire' ? 'Primaire' : 'Secondaire'}
                    </Badge>
                  </div>
                  
                  {classe.section && (
                    <div>
                      <p className="text-xs text-muted-foreground">Section</p>
                      <p className="font-medium">{sections[classe.section] || classe.section}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Élèves actuels</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{classe.nombre_eleves} / {classe.capacite_max}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((classe.nombre_eleves / classe.capacite_max) * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Statut actuel</p>
                    <Badge variant={getStatutColor(classe.statut) as any}>
                      {statuts.find(s => s.value === classe.statut)?.label || classe.statut}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aperçu des modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Aperçu des changements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {data.nom_classe !== classe.nom_classe && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="font-medium text-amber-800">Nom modifié</p>
                      <p className="text-amber-700">
                        <span className="line-through">{classe.nom_classe}</span>
                        {' → '}
                        <span className="font-medium">{data.nom_classe}</span>
                      </p>
                    </div>
                  )}
                  
                  {data.niveau !== classe.niveau && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="font-medium text-amber-800">Niveau modifié</p>
                      <p className="text-amber-700">
                        <span className="line-through">
                          {classe.niveau === 'primaire' ? 'Primaire' : 'Secondaire'}
                        </span>
                        {' → '}
                        <span className="font-medium">
                          {data.niveau === 'primaire' ? 'Primaire' : 'Secondaire'}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {data.capacite_max !== classe.capacite_max && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-800">Capacité modifiée</p>
                      <p className="text-blue-700">
                        <span className="line-through">{classe.capacite_max}</span>
                        {' → '}
                        <span className="font-medium">{data.capacite_max}</span>
                      </p>
                    </div>
                  )}
                  
                  {data.statut !== classe.statut && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="font-medium text-purple-800">Statut modifié</p>
                      <p className="text-purple-700">
                        <span className="line-through">
                          {statuts.find(s => s.value === classe.statut)?.label || classe.statut}
                        </span>
                        {' → '}
                        <span className="font-medium">
                          {statuts.find(s => s.value === data.statut)?.label || data.statut}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {(data.nom_classe === classe.nom_classe &&
                    data.niveau === classe.niveau &&
                    data.capacite_max === classe.capacite_max &&
                    data.statut === classe.statut) && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun changement détecté
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/classes/${classe.id}/rapport`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    Générer un rapport
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
                  Réinitialiser le formulaire
                </Button>
                
                {classe.nombre_eleves === 0 && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classe.nom_classe}" ? Cette action est irréversible.`)) {
                        // router.delete(`/classes/${classe.id}`)
                      }
                    }}
                  >
                    Supprimer la classe
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}