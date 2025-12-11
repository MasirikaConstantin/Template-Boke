import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';

interface ConfigurationFraisFormProps {
  auth: any;
  frai?: {
    id?: number;
    annee_scolaire: string;
    nom_frais: string;
    montant_total: number;
    est_actif: boolean;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function ConfigurationFraisForm({ auth, frai, flash }: ConfigurationFraisFormProps) {
  const { data, setData, errors, processing, post, put } = useForm({
    annee_scolaire: frai?.annee_scolaire || '',
    nom_frais: frai?.nom_frais || '',
    montant_total: frai?.montant_total || 0,
    est_actif: frai?.est_actif ?? true,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (frai?.id) {
      put(`/configuration-frais/${frai.id}`);
    } else {
      post('/configuration-frais');
    }
  };

  return (
    <>
      <Head title={frai?.id ? "Modifier la configuration" : "Nouvelle configuration"} />
      
      <DashboardLayout activeRoute="/configuration-frais">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {frai?.id ? "Modifier la configuration" : "Nouvelle configuration"}
              </h1>
              <p className="text-muted-foreground">
                {frai?.id 
                  ? "Modifiez les informations de cette configuration de frais"
                  : "Créez une nouvelle configuration de frais pour l'école"}
              </p>
            </div>
            <Link href="/configuration-frais">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
            </Link>
          </div>

          {flash?.success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>{flash.success}</AlertDescription>
            </Alert>
          )}

          {flash?.error && (
            <Alert variant="destructive">
              <AlertDescription>{flash.error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                <CreditCard className="h-5 w-5 inline-block mr-2" />
                Informations de la configuration
              </CardTitle>
              <CardDescription>
                Remplissez les détails de cette configuration de frais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom_frais">Nom du frais *</Label>
                    <Input
                      id="nom_frais"
                      value={data.nom_frais}
                      onChange={(e) => setData('nom_frais', e.target.value)}
                      placeholder="Ex: Frais de scolarité 2024"
                      className={errors.nom_frais ? 'border-destructive' : ''}
                    />
                    {errors.nom_frais && (
                      <p className="text-sm text-destructive">{errors.nom_frais}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annee_scolaire">Année scolaire *</Label>
                    <Input
                      id="annee_scolaire"
                      value={data.annee_scolaire}
                      onChange={(e) => setData('annee_scolaire', e.target.value)}
                      placeholder="Ex: 2024-2025"
                      className={errors.annee_scolaire ? 'border-destructive' : ''}
                    />
                    {errors.annee_scolaire && (
                      <p className="text-sm text-destructive">{errors.annee_scolaire}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montant_total">Montant total (USD) *</Label>
                    <Input
                      id="montant_total"
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.montant_total}
                      onChange={(e) => setData('montant_total', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.montant_total ? 'border-destructive' : ''}
                    />
                    {errors.montant_total && (
                      <p className="text-sm text-destructive">{errors.montant_total}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="est_actif">Statut</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="est_actif"
                        checked={data.est_actif}
                        onCheckedChange={(checked) => setData('est_actif', checked)}
                      />
                      <Label htmlFor="est_actif" className="cursor-pointer">
                        {data.est_actif ? 'Actif' : 'Inactif'}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {data.est_actif 
                        ? 'Cette configuration est actuellement active' 
                        : 'Cette configuration est actuellement inactive'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Link href="/configuration-frais">
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    <Save className="h-4 w-4 mr-2" />
                    {processing ? 'Enregistrement...' : frai?.id ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}