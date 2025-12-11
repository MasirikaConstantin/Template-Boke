import React, { useEffect, useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Calendar as CalendarIcon, Hash, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';

interface ConfigurationFrais {
  id: number;
  nom_frais: string;
  annee_scolaire: string;
  montant_total: number;
  est_actif: boolean;
}

interface TrancheFormProps {
  auth: any;
  tranche?: {
    id?: number;
    configuration_frai_id: number;
    nom_tranche: string;
    montant: number;
    date_limite: string;
    ordre: number;
  };
  configurations: ConfigurationFrais[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function TrancheForm({ auth, tranche, configurations, flash }: TrancheFormProps) {
  const { data, setData, errors, processing, post, put } = useForm({
    configuration_frai_id: tranche?.configuration_frai_id || configurations[0]?.id || '',
    nom_tranche: tranche?.nom_tranche || '',
    montant: tranche?.montant || 0,
    date_limite: tranche?.date_limite || '',
    ordre: tranche?.ordre || 1,
  });

  const [selectedConfig, setSelectedConfig] = useState<ConfigurationFrais | null>(null);

  useEffect(() => {
    if (data.configuration_frai_id) {
      const config = configurations.find(c => c.id === parseInt(data.configuration_frai_id as any));
      setSelectedConfig(config || null);
    }
  }, [data.configuration_frai_id, configurations]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tranche?.id) {
      put(`/tranches/${tranche.id}`);
    } else {
      post('/tranches');
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  return (
    <>
      <Head title={tranche?.id ? "Modifier la tranche" : "Nouvelle tranche"} />
      
      <DashboardLayout activeRoute="/tranches">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {tranche?.id ? "Modifier la tranche" : "Nouvelle tranche"}
              </h1>
              <p className="text-muted-foreground">
                {tranche?.id 
                  ? "Modifiez les informations de cette tranche de paiement"
                  : "Créez une nouvelle tranche de paiement pour une configuration de frais"}
              </p>
            </div>
            <Link href="/tranches">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations de la tranche
                </CardTitle>
                <CardDescription>
                  Remplissez les détails de cette tranche de paiement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="configuration_frai_id">Configuration de frais *</Label>
                      <Select
                        value={data.configuration_frai_id.toString()}
                        onValueChange={(value) => setData('configuration_frai_id', parseInt(value))}
                      >
                        <SelectTrigger className={errors.configuration_frai_id ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Sélectionnez une configuration" />
                        </SelectTrigger>
                        <SelectContent>
                          {configurations.map((config) => (
                            <SelectItem key={config.id} value={config.id.toString()}>
                              {config.nom_frais} ({config.annee_scolaire}) - {formatMontant(config.montant_total)}
                              {config.est_actif ? '' : ' (Inactif)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.configuration_frai_id && (
                        <p className="text-sm text-destructive">{errors.configuration_frai_id}</p>
                      )}
                      {selectedConfig && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Configuration sélectionnée: {selectedConfig.nom_frais} ({selectedConfig.annee_scolaire})
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ordre">Ordre *</Label>
                      <Input
                        id="ordre"
                        type="number"
                        min="1"
                        value={data.ordre}
                        onChange={(e) => setData('ordre', parseInt(e.target.value) || 1)}
                        placeholder="1"
                        className={errors.ordre ? 'border-destructive' : ''}
                      />
                      {errors.ordre && (
                        <p className="text-sm text-destructive">{errors.ordre}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Ordre d'apparition dans la configuration
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nom_tranche">Nom de la tranche *</Label>
                      <Input
                        id="nom_tranche"
                        value={data.nom_tranche}
                        onChange={(e) => setData('nom_tranche', e.target.value)}
                        placeholder="Ex: Premier trimestre"
                        className={errors.nom_tranche ? 'border-destructive' : ''}
                      />
                      {errors.nom_tranche && (
                        <p className="text-sm text-destructive">{errors.nom_tranche}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="montant">Montant (USD) *</Label>
                      <Input
                        id="montant"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.montant}
                        onChange={(e) => setData('montant', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={errors.montant ? 'border-destructive' : ''}
                      />
                      {errors.montant && (
                        <p className="text-sm text-destructive">{errors.montant}</p>
                      )}
                      {selectedConfig && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Total configuration: {formatMontant(selectedConfig.montant_total)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_limite">Date limite *</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date_limite"
                          type="date"
                          value={data.date_limite}
                          onChange={(e) => setData('date_limite', e.target.value)}
                          className={`pl-10 ${errors.date_limite ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.date_limite && (
                        <p className="text-sm text-destructive">{errors.date_limite}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Date limite de paiement
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Link href="/tranches">
                      <Button type="button" variant="outline">
                        Annuler
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? 'Enregistrement...' : tranche?.id ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Informations utiles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">À propos des tranches</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Les tranches permettent de diviser le paiement total en plusieurs échéances</li>
                    <li>Chaque tranche a un ordre qui définit sa position dans le calendrier de paiement</li>
                    <li>La date limite est la date butoir pour le paiement de la tranche</li>
                    <li>Assurez-vous que la somme des tranches correspond au montant total de la configuration</li>
                  </ul>
                </div>

                {selectedConfig && (
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-semibold">Configuration sélectionnée</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nom:</span>
                        <span className="font-medium">{selectedConfig.nom_frais}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Année:</span>
                        <span>{selectedConfig.annee_scolaire}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant total:</span>
                        <span className="font-semibold">{formatMontant(selectedConfig.montant_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Statut:</span>
                        <Badge variant={selectedConfig.est_actif ? "default" : "secondary"}>
                          {selectedConfig.est_actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
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