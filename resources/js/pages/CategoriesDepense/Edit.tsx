import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Calendar, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';

interface Budget {
  id: number;
  annee: string;
  mois: string;
  montant_alloue: number;
  montant_depense: number;
  description: string | null;
  est_actif: boolean;
}

interface BudgetEditProps {
  auth: any;
  budget: Budget;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function BudgetEdit({ auth, budget, flash }: BudgetEditProps) {
  const { data, setData, errors, processing, put } = useForm({
    annee: budget.annee,
    mois: budget.mois,
    montant_alloue: budget.montant_alloue,
    description: budget.description || '',
    est_actif: budget.est_actif,
  });

  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const annees = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() + i).toString());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/budgets/${budget.id}`);
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
    }).format(montant);
  };

  return (
    <>
      <Head title="Modifier le budget" />
      
      <DashboardLayout activeRoute="/budgets">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Modifier le budget {budget.mois} {budget.annee}
              </h1>
              <p className="text-muted-foreground">
                Montant déjà dépensé: {formatMontant(budget.montant_depense)}
              </p>
            </div>
            <Link href="/budgets">
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
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informations du budget
              </CardTitle>
              <CardDescription>
                Modifiez les détails de ce budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="annee">Année *</Label>
                    <Select
                      value={data.annee}
                      onValueChange={(value) => setData('annee', value)}
                    >
                      <SelectTrigger className={errors.annee ? 'border-destructive' : ''}>
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sélectionnez l'année" />
                      </SelectTrigger>
                      <SelectContent>
                        {annees.map((annee) => (
                          <SelectItem key={annee} value={annee}>
                            {annee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.annee && (
                      <p className="text-sm text-destructive">{errors.annee}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mois">Mois *</Label>
                    <Select
                      value={data.mois}
                      onValueChange={(value) => setData('mois', value)}
                    >
                      <SelectTrigger className={errors.mois ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Sélectionnez le mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {mois.map((moisItem) => (
                          <SelectItem key={moisItem} value={moisItem}>
                            {moisItem.charAt(0).toUpperCase() + moisItem.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mois && (
                      <p className="text-sm text-destructive">{errors.mois}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montant_alloue">Montant alloué (CDF) *</Label>
                    <Input
                      id="montant_alloue"
                      type="number"
                      min={budget.montant_depense}
                      step="0.01"
                      value={data.montant_alloue}
                      onChange={(e) => setData('montant_alloue', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.montant_alloue ? 'border-destructive' : ''}
                    />
                    {errors.montant_alloue && (
                      <p className="text-sm text-destructive">{errors.montant_alloue}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Minimum: {formatMontant(budget.montant_depense)} (déjà dépensé)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="est_actif">Statut</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="est_actif"
                        checked={data.est_actif}
                        onCheckedChange={(checked) => setData('est_actif', checked === true)}
                      />
                      <Label htmlFor="est_actif" className="cursor-pointer">
                        Budget actif
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Un budget actif peut recevoir de nouvelles dépenses
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description (optionnelle)</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Description du budget..."
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Link href="/budgets">
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    <Save className="h-4 w-4 mr-2" />
                    {processing ? 'Mise à jour...' : 'Mettre à jour'}
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