import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  BookOpen,
  Clock,
  Calendar,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Search,
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
}

interface ProfesseurAffectationProps {
  professeur: {
    id: number;
    nom_complet: string;
    matricule: string;
    classes: Classe[];
    matieres_enseignees: Matiere[];
  };
}

export default function ProfesseurAffectation({
  professeur,
}: ProfesseurAffectationProps) {
  const [search, setSearch] = useState('');
  const { data, setData, post, processing, errors, reset } = useForm({
    classe_id: '',
    matiere_id: '',
    volume_horaire: 4,
    jours_cours: [] as string[],
  });

  const joursOptions = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.classe_id || !data.matiere_id) {
      alert('Veuillez sélectionner une classe et une matière');
      return;
    }

    post(`/professeurs/${professeur.id}/affecter-classe`, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const handleDesaffecter = (classeId: number, matiereId: number) => {
    if (confirm('Êtes-vous sûr de vouloir désaffecter ce professeur de cette classe ?')) {
      router.delete(`/professeurs/${professeur.id}/desaffecter-classe/${classeId}/${matiereId}`);
    }
  };

  const toggleJour = (jour: string) => {
    const newJours = data.jours_cours.includes(jour)
      ? data.jours_cours.filter(j => j !== jour)
      : [...data.jours_cours, jour];
    setData('jours_cours', newJours);
  };

  const filteredMatieres = professeur.matieres_enseignees.filter(matiere =>
    matiere.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head title={`Affectations - ${professeur.nom_complet}`} />
      
      <DashboardLayout activeRoute="/professeurs">
        <PageHeader
          title={`Gestion des affectations`}
          description={`Professeur: ${professeur.nom_complet}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Professeurs', href: '/professeurs' },
            { label: professeur.nom_complet, href: `/professeurs/${professeur.id}` },
            { label: 'Affectations', href: `/professeurs/${professeur.id}/affectation` },
          ]}
          actions={
            <Link href={`/professeurs/${professeur.id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au professeur
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Ajouter une affectation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une affectation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="classe_id">Classe *</Label>
                    <Select
                      value={data.classe_id}
                      onValueChange={(value) => setData('classe_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__null__">Choisir une classe...</SelectItem>
                        {/* Les classes seraient récupérées depuis une API */}
                        <SelectItem value="1">1ère A - Sciences</SelectItem>
                        <SelectItem value="2">2nde B - Littéraire</SelectItem>
                        <SelectItem value="3">Terminale C - Mathématiques</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.classe_id && (
                      <p className="text-sm text-destructive">{errors.classe_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matiere_id">Matière *</Label>
                    <div className="relative mb-2">
                      <Input
                        placeholder="Rechercher une matière..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <Select
                      value={data.matiere_id}
                      onValueChange={(value) => setData('matiere_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__null__">Choisir une matière...</SelectItem>
                        {filteredMatieres.map((matiere) => (
                          <SelectItem key={matiere.id} value={matiere.id.toString()}>
                            {matiere.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.matiere_id && (
                      <p className="text-sm text-destructive">{errors.matiere_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volume_horaire">Volume horaire (heures/semaine) *</Label>
                    <Select
                      value={data.volume_horaire.toString()}
                      onValueChange={(value) => setData('volume_horaire', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre d'heures" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 heures</SelectItem>
                        <SelectItem value="4">4 heures</SelectItem>
                        <SelectItem value="6">6 heures</SelectItem>
                        <SelectItem value="8">8 heures</SelectItem>
                        <SelectItem value="10">10 heures</SelectItem>
                        <SelectItem value="12">12 heures</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.volume_horaire && (
                      <p className="text-sm text-destructive">{errors.volume_horaire}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Jours de cours</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {joursOptions.map((jour) => (
                        <div key={jour.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`jour-${jour.value}`}
                            checked={data.jours_cours.includes(jour.value)}
                            onChange={() => toggleJour(jour.value)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`jour-${jour.value}`} className="text-sm cursor-pointer">
                            {jour.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.jours_cours && (
                      <p className="text-sm text-destructive">{errors.jours_cours}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={processing} className="w-full">
                      {processing ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Affectation en cours...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter l'affectation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Classes assignées</span>
                    <span className="font-medium">{professeur.classes.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Matières enseignées</span>
                    <span className="font-medium">{professeur.matieres_enseignees.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total heures/semaine</span>
                    <span className="font-medium">
                      {professeur.classes.reduce((total, classe) => 
                        total + (classe.pivot?.volume_horaire || 0), 0
                      )}h
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Liste des affectations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Affectations actuelles ({professeur.classes.length})
                  </CardTitle>
                  <Badge variant="outline">
                    {professeur.classes.reduce((total, classe) => 
                      total + (classe.pivot?.volume_horaire || 0), 0
                    )}h/semaine
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {professeur.classes.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Aucune affectation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utilisez le formulaire pour ajouter des affectations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {professeur.classes.map((classe) => (
                      <div key={classe.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{classe.nom_classe}</h3>
                              <Badge variant="outline">{classe.niveau}</Badge>
                            </div>
                            {classe.matiere && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Matière: <span className="font-medium">{classe.matiere.nom}</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {classe.pivot?.volume_horaire && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {classe.pivot.volume_horaire}h/semaine
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDesaffecter(classe.id, classe.pivot?.matiere_id || 0)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <Link href={`/classes/${classe.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Voir la classe
                            </Button>
                          </Link>
                          
                          <div className="text-muted-foreground">
                            Affecté le {new Date().toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations sur les matières enseignées */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Matières enseignées</CardTitle>
              </CardHeader>
              <CardContent>
                {professeur.matieres_enseignees.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Aucune matière spécifiée</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {professeur.matieres_enseignees.map((matiere) => (
                      <Badge key={matiere.id} variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {matiere.nom}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}