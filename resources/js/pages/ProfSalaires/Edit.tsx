import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CreditCard, AlertCircle, User, Clock, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface ProfSalaire {
  id: number;
  professeur_id: number;
  type_salaire: 'horaire' | 'mensuel';
  taux_horaire: number | null;
  salaire_fixe: number | null;
  ref: string;
}

interface EditProfSalaireProps {
  profSalaire: ProfSalaire;
  professeurs: Array<{
    id: number;
    nom: string;
    email: string;
  }>;
}

export default function EditProfSalaire({ profSalaire, professeurs }: EditProfSalaireProps) {
  const { data, setData, put, processing, errors, reset } = useForm({
    professeur_id: profSalaire.professeur_id.toString(),
    type_salaire: profSalaire.type_salaire,
    taux_horaire: profSalaire.taux_horaire?.toString() || '',
    salaire_fixe: profSalaire.salaire_fixe?.toString() || '',
  });

  const [selectedType, setSelectedType] = useState(profSalaire.type_salaire);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/prof-salaires/${profSalaire.id}`);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setData('type_salaire', value);
    // Réinitialiser les valeurs lorsqu'on change de type
    if (value === 'horaire') {
      setData('salaire_fixe', '');
    } else {
      setData('taux_horaire', '');
    }
  };

  const typesSalaire = [
    { value: 'horaire', label: 'Horaire', icon: '🕐', description: 'Rémunération basée sur les heures travaillées' },
    { value: 'mensuel', label: 'Mensuel', icon: '💰', description: 'Salaire fixe mensuel' },
  ];

  const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};


  return (
    <>
      <Head title={`Modifier le salaire - ${profSalaire.ref}`} />
      
      <DashboardLayout activeRoute="/prof-salaires">
        <PageHeader
          title="Modifier le salaire"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Salaires', href: '/prof-salaires' },
            { label: profSalaire.ref, href: `/prof-salaires/${profSalaire.id}` },
            { label: 'Modifier', href: `/prof-salaires/${profSalaire.id}/edit` },
          ]}
          actions={
            <Link href="/prof-salaires">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          }
        />

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Modifier la configuration de salaire
            </CardTitle>
            <CardDescription>
              Référence: <span className="font-mono">{profSalaire.ref}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur */}
              {(errors.professeur_id || errors.type_salaire) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.professeur_id || errors.type_salaire}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="professeur" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="professeur">Professeur</TabsTrigger>
                  <TabsTrigger value="salaire">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="professeur" className="space-y-6 pt-6">
                  {/* Sélection du professeur */}
                  <div className="space-y-4">
                    <Label htmlFor="professeur_id">Professeur *</Label>
                    <Select
                      value={data.professeur_id}
                      onValueChange={value => setData('professeur_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un professeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {professeurs.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold">
                                  {prof.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{prof.nom}</div>
                                <div className="text-xs text-muted-foreground">{prof.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Le professeur actuel est déjà sélectionné
                    </p>
                    {errors.professeur_id && (
                      <p className="text-sm text-destructive">{errors.professeur_id}</p>
                    )}
                  </div>

                  {/* Avertissement */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Changer de professeur transférera cette configuration de salaire à un autre professeur.
                      Assurez-vous que le nouveau professeur n'a pas déjà une configuration active.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="salaire" className="space-y-6 pt-6">
                  {/* Type de salaire */}
                  <div className="space-y-4">
                    <Label>Type de salaire *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {typesSalaire.map((type) => (
                        <Card
                          key={type.value}
                          className={`cursor-pointer transition-all ${
                            selectedType === type.value
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'hover:border-border'
                          }`}
                          onClick={() => handleTypeChange(type.value)}
                        >
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="text-2xl">{type.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {type.description}
                              </div>
                            </div>
                            {selectedType === type.value && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <input type="hidden" name="type_salaire" value={selectedType} />
                    {errors.type_salaire && (
                      <p className="text-sm text-destructive">{errors.type_salaire}</p>
                    )}
                  </div>

                  {/* Montant selon le type */}
                  {selectedType === 'horaire' ? (
                    <div className="space-y-4">
                      <Label htmlFor="taux_horaire">Taux horaire ($/heure) *</Label>
                      <div className="relative">
                        <Input
                          id="taux_horaire"
                          type="text"
                          value={data.taux_horaire}
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9.,]/g, '');
                            setData('taux_horaire', value);
                          }}
                          placeholder="Ex: 25,50"
                          className="pl-10"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                          $/h
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Estimation mensuelle (35h/semaine):{' '}
                          <span className="font-semibold">
                            {data.taux_horaire 
                              ? `${formatCurrency((parseFloat(data.taux_horaire.replace(',', '.')) || 0) * 35 * 4.33)} $` 
                              : '0,00 $'}
                          </span>
                        </p>
                      </div>
                      {errors.taux_horaire && (
                        <p className="text-sm text-destructive">{errors.taux_horaire}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label htmlFor="salaire_fixe">Salaire mensuel fixe *</Label>
                      <div className="relative">
                        <Input
                          id="salaire_fixe"
                          type="text"
                          value={data.salaire_fixe}
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9.,]/g, '');
                            setData('salaire_fixe', value);
                          }}
                          placeholder="Ex: 2500,00"
                          className="pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                          $/mois
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Estimation annuelle: <span className="font-semibold">
                            {data.salaire_fixe 
                              ? `${formatCurrency((parseFloat(data.salaire_fixe.replace(',', '.')) || 0) * 12)} $` 
                              : '0,00 $'}
                          </span>
                        </p>
                      </div>
                      {errors.salaire_fixe && (
                        <p className="text-sm text-destructive">{errors.salaire_fixe}</p>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/prof-salaires">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Mise à jour en cours...' : 'Mettre à jour'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}