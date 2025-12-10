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
import { ArrowLeft, School, AlertCircle, Users } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface CreateClasseProps {
  professeurs: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  sections: Record<string, string>;
}

export default function CreateClasse({ professeurs, sections }: CreateClasseProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    nom_classe: '',
    niveau: 'primaire',
    section: '',
    professeur_principal_id: '',
    capacite_max: 30,
    description: '',
  });

  const [selectedNiveau, setSelectedNiveau] = useState('primaire');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/classes');
  };

  const handleNiveauChange = (value: string) => {
    setSelectedNiveau(value);
    setData('niveau', value);
    if (value === 'primaire') {
      setData('section', '');
    }
  };

  const niveaux = [
    { value: 'primaire', label: 'Primaire', icon: '📚' },
    { value: 'secondaire', label: 'Secondaire', icon: '🎓' },
  ];
  console.log(sections);

  return (
    <>
      <Head title="Créer une classe" />
      
      <DashboardLayout activeRoute="/classes">
        <PageHeader
          title="Créer une classe"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/classes' },
            { label: 'Créer', href: '/classes/create' },
          ]}
          actions={
            <Link href="/classes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          }
        />

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Nouvelle classe
            </CardTitle>
            <CardDescription>
              Créez une nouvelle classe en remplissant les informations ci-dessous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur */}
              {errors.nom_classe && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.nom_classe}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="infos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
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
                    {errors.nom_classe && (
                      <p className="text-sm text-destructive">{errors.nom_classe}</p>
                    )}
                  </div>

                  {/* Niveau */}
                  <div className="space-y-2">
                    <Label>Niveau *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {niveaux.map((niveau) => (
                        <Card
                          key={niveau.value}
                          className={`cursor-pointer transition-all ${
                            selectedNiveau === niveau.value
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'hover:border-border'
                          }`}
                          onClick={() => handleNiveauChange(niveau.value)}
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
                    <input type="hidden" name="niveau" value={selectedNiveau} />
                    {errors.niveau && (
                      <p className="text-sm text-destructive">{errors.niveau}</p>
                    )}
                  </div>

                  {/* Section (seulement pour secondaire) */}
                  {selectedNiveau === 'secondaire' && (
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

                  {/* Capacité maximale */}
                  <div className="space-y-2">
                    <Label htmlFor="capacite_max">Capacité maximale *</Label>
                    <div className="relative">
                      <Input
                        id="capacite_max"
                        type="number"
                        min="1"
                        max="100"
                        value={data.capacite_max}
                        onChange={e => setData('capacite_max', parseInt(e.target.value) || 30)}
                        className="pl-10"
                      />
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nombre maximum d'élèves dans la classe
                    </p>
                    {errors.capacite_max && (
                      <p className="text-sm text-destructive">{errors.capacite_max}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6 pt-6">
                  {/* Professeur principal */}
                  <div className="space-y-2">
                    <Label htmlFor="professeur_principal_id">Professeur principal</Label>
                    <Select
                      value={data.professeur_principal_id}
                      onValueChange={value => setData('professeur_principal_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un professeur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rien">Aucun (à assigner plus tard)</SelectItem>
                        {professeurs.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            {prof.name} - {prof.email}
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
                    <p className="text-xs text-muted-foreground">
                      Optionnel - Maximum 500 caractères
                    </p>
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/classes">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Création en cours...' : 'Créer la classe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}