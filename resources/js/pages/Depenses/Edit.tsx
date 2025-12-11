import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  DollarSign,
  Wallet,
  Folder,
  FileText,
  Upload,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';

interface Budget {
  id: number;
  nom_complet: string;
  montant_alloue: number;
  montant_depense: number;
  montant_restant: number;
}

interface CategorieDepense {
  id: number;
  nom_categorie: string;
}

interface Depense {
  id: number;
  budget_id: number;
  categorie_depense_id: number;
  reference: string;
  libelle: string;
  montant: number;
  mode_paiement: string;
  beneficiaire: string;
  description: string | null;
  date_depense: string;
  numero_piece: string | null;
  fichier_joint: string | null;
  statut: string;
  budget?: Budget;
  categorie?: CategorieDepense;
}

interface DepenseEditProps {
  auth: any;
  depense: Depense;
  budgets: Budget[];
  categories: CategorieDepense[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function DepenseEdit({ 
  auth, 
  depense, 
  budgets, 
  categories,
  flash 
}: DepenseEditProps) {
  const { data, setData, errors, processing, put } = useForm({
    budget_id: depense.budget_id,
    categorie_depense_id: depense.categorie_depense_id,
    reference: depense.reference,
    libelle: depense.libelle,
    montant: depense.montant,
    mode_paiement: depense.mode_paiement,
    beneficiaire: depense.beneficiaire,
    description: depense.description || '',
    date_depense: depense.date_depense,
    numero_piece: depense.numero_piece || '',
    fichier_joint: null as File | null,
    statut: depense.statut,
  });

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(depense.budget || null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(depense.fichier_joint);

  useEffect(() => {
    if (data.budget_id) {
      const budget = budgets.find(b => b.id === parseInt(data.budget_id as any));
      setSelectedBudget(budget || null);
    }
  }, [data.budget_id, budgets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('fichier_joint', file);
      setCurrentFile(null);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setData('fichier_joint', null);
    setCurrentFile(null);
    setFilePreview(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key] as any);
      }
    });

    put(`/depenses/${depense.id}`, {
      data: formData,
      forceFormData: true,
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
    }).format(montant);
  };

  return (
    <>
      <Head title="Modifier la dépense" />
      
      <DashboardLayout activeRoute="/budgets">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Modifier la dépense {depense.reference}
              </h1>
              <p className="text-muted-foreground">
                {depense.libelle} - {formatMontant(depense.montant)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/depenses">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/depenses/${depense.id}`}>
                <Button variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
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
                  <DollarSign className="h-5 w-5" />
                  Informations de la dépense
                </CardTitle>
                <CardDescription>
                  Modifiez les détails de cette dépense
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="budget_id">Budget *</Label>
                      <Select
                        value={data.budget_id.toString()}
                        onValueChange={(value) => setData('budget_id', parseInt(value))}
                      >
                        <SelectTrigger className={errors.budget_id ? 'border-destructive' : ''}>
                          <Wallet className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sélectionnez un budget" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgets.map((budget) => (
                            <SelectItem key={budget.id} value={budget.id.toString()}>
                              {budget.nom_complet} - Restant: {formatMontant(budget.montant_restant)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.budget_id && (
                        <p className="text-sm text-destructive">{errors.budget_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categorie_depense_id">Catégorie *</Label>
                      <Select
                        value={data.categorie_depense_id.toString()}
                        onValueChange={(value) => setData('categorie_depense_id', parseInt(value))}
                      >
                        <SelectTrigger className={errors.categorie_depense_id ? 'border-destructive' : ''}>
                          <Folder className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((categorie) => (
                            <SelectItem key={categorie.id} value={categorie.id.toString()}>
                              {categorie.nom_categorie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categorie_depense_id && (
                        <p className="text-sm text-destructive">{errors.categorie_depense_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Référence *</Label>
                      <Input
                        id="reference"
                        value={data.reference}
                        onChange={(e) => setData('reference', e.target.value)}
                        placeholder="DEP-XXXXXX"
                        className={errors.reference ? 'border-destructive' : ''}
                        readOnly
                      />
                      {errors.reference && (
                        <p className="text-sm text-destructive">{errors.reference}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_depense">Date de dépense *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date_depense"
                          type="date"
                          value={data.date_depense}
                          onChange={(e) => setData('date_depense', e.target.value)}
                          className={`pl-10 ${errors.date_depense ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.date_depense && (
                        <p className="text-sm text-destructive">{errors.date_depense}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="libelle">Libellé *</Label>
                      <Input
                        id="libelle"
                        value={data.libelle}
                        onChange={(e) => setData('libelle', e.target.value)}
                        placeholder="Ex: Achat de matériel informatique"
                        className={errors.libelle ? 'border-destructive' : ''}
                      />
                      {errors.libelle && (
                        <p className="text-sm text-destructive">{errors.libelle}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="montant">Montant (CDF) *</Label>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mode_paiement">Mode de paiement *</Label>
                      <Select
                        value={data.mode_paiement}
                        onValueChange={(value) => setData('mode_paiement', value)}
                      >
                        <SelectTrigger className={errors.mode_paiement ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Sélectionnez un mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="espèce">Espèce</SelectItem>
                          <SelectItem value="chèque">Chèque</SelectItem>
                          <SelectItem value="virement">Virement</SelectItem>
                          <SelectItem value="carte">Carte</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.mode_paiement && (
                        <p className="text-sm text-destructive">{errors.mode_paiement}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beneficiaire">Bénéficiaire *</Label>
                      <Input
                        id="beneficiaire"
                        value={data.beneficiaire}
                        onChange={(e) => setData('beneficiaire', e.target.value)}
                        placeholder="Nom du bénéficiaire"
                        className={errors.beneficiaire ? 'border-destructive' : ''}
                      />
                      {errors.beneficiaire && (
                        <p className="text-sm text-destructive">{errors.beneficiaire}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numero_piece">Numéro de pièce (optionnel)</Label>
                      <Input
                        id="numero_piece"
                        value={data.numero_piece}
                        onChange={(e) => setData('numero_piece', e.target.value)}
                        placeholder="N° de facture, reçu, etc."
                        className={errors.numero_piece ? 'border-destructive' : ''}
                      />
                      {errors.numero_piece && (
                        <p className="text-sm text-destructive">{errors.numero_piece}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="statut">Statut *</Label>
                      <Select
                        value={data.statut}
                        onValueChange={(value) => setData('statut', value)}
                      >
                        <SelectTrigger className={errors.statut ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brouillon">Brouillon</SelectItem>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="approuve">Approuvé</SelectItem>
                          <SelectItem value="rejete">Rejeté</SelectItem>
                          <SelectItem value="paye">Payé</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.statut && (
                        <p className="text-sm text-destructive">{errors.statut}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description (optionnelle)</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Description détaillée de la dépense..."
                        rows={3}
                        className={errors.description ? 'border-destructive' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fichier_joint">Fichier joint (optionnel)</Label>
                      
                      {currentFile && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              <span className="text-sm">Fichier actuel</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeFile}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="border-2 border-dashed rounded-lg p-4">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <Label htmlFor="fichier-upload" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">
                              Cliquez pour télécharger ou glissez-déposez
                            </span>
                            <Input
                              id="fichier-upload"
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </Label>
                          <p className="text-xs text-muted-foreground mt-2">
                            JPG, PNG ou PDF (max 2MB)
                          </p>
                        </div>
                        {filePreview && (
                          <div className="mt-4">
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="max-h-32 mx-auto rounded"
                            />
                          </div>
                        )}
                        {data.fichier_joint && !filePreview && !currentFile && (
                          <div className="mt-4 text-center">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-sm mt-2">
                              {(data.fichier_joint as any).name || 'Fichier sélectionné'}
                            </p>
                          </div>
                        )}
                      </div>
                      {errors.fichier_joint && (
                        <p className="text-sm text-destructive">{errors.fichier_joint}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Link href={`/depenses/${depense.id}`}>
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

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Référence:</span>
                      <span className="font-mono font-medium">{data.reference}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {new Date(data.date_depense).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Mode:</span>
                      <span className="font-medium capitalize">{data.mode_paiement}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Montant:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatMontant(data.montant)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Statut:</span>
                      <span className="font-medium capitalize">{data.statut.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedBudget && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Budget sélectionné
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="font-medium">{selectedBudget.nom_complet}</div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Alloué:</span>
                          <span className="font-medium">{formatMontant(selectedBudget.montant_alloue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dépensé:</span>
                          <span>{formatMontant(selectedBudget.montant_depense)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Restant:</span>
                          <span className={`font-semibold ${
                            selectedBudget.montant_restant < data.montant ? 'text-destructive' :
                            selectedBudget.montant_restant < (selectedBudget.montant_alloue * 0.2) ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {formatMontant(selectedBudget.montant_restant)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedBudget.montant_restant < data.montant && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                        ⚠️ Le montant dépasse le budget restant
                      </div>
                    )}

                    {selectedBudget.montant_restant < (selectedBudget.montant_alloue * 0.2) && (
                      <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg">
                        ⚠️ Budget presque épuisé
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}