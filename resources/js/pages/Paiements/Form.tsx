import React, { useEffect, useState } from 'react';
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
  User, 
  CreditCard, 
  FileText,
  Receipt
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  ref: string;
}

interface Tranche {
  id: number;
  nom_tranche: string;
  montant: number;
  date_limite: string;
  ordre: number;
  configuration_frais?: {
    nom_frais: string;
    annee_scolaire: string;
    montant_total: number;
  };
}

interface PaiementFormProps {
  auth: any;
  paiement?: {
    id?: number;
    eleve_id: number | null;
    tranche_id: number | null;
    reference: string;
    montant: number;
    mode_paiement: 'espèce' | 'chèque' | 'virement' | 'mobile_money';
    numero_cheque: string | null;
    commentaire: string | null;
    date_paiement: string;
  };
  eleves: Eleve[];
  tranches: Tranche[];
  reference?: string;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function PaiementForm({ 
  auth, 
  paiement, 
  eleves, 
  tranches, 
  reference,
  flash 
}: PaiementFormProps) {
  const { data, setData, errors, processing, post, put } = useForm({
    eleve_id: paiement?.eleve_id || '',
    tranche_id: paiement?.tranche_id || '',
    reference: paiement?.reference || reference || '',
    montant: paiement?.montant || 0,
    mode_paiement: paiement?.mode_paiement || 'espèce',
    numero_cheque: paiement?.numero_cheque || '',
    commentaire: paiement?.commentaire || '',
    date_paiement: paiement?.date_paiement || new Date().toISOString().split('T')[0],
  });

  const [selectedTranche, setSelectedTranche] = useState<Tranche | null>(null);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [showChequeField, setShowChequeField] = useState(data.mode_paiement === 'chèque');

  useEffect(() => {
    if (data.tranche_id) {
      const tranche = tranches.find(t => t.id === parseInt(data.tranche_id as any));
      setSelectedTranche(tranche || null);
      if (tranche && !data.montant) {
        setData('montant', tranche.montant);
      }
    }
  }, [data.tranche_id, tranches]);

  useEffect(() => {
    if (data.eleve_id) {
      const eleve = eleves.find(e => e.id === parseInt(data.eleve_id as any));
      setSelectedEleve(eleve || null);
    }
  }, [data.eleve_id, eleves]);

  useEffect(() => {
    setShowChequeField(data.mode_paiement === 'chèque');
  }, [data.mode_paiement]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paiement?.id) {
      put(`/paiements/${paiement.id}`);
    } else {
      post('/paiements');
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const getEleveLabel = (eleve: Eleve) => {
    return `${eleve.nom} ${eleve.prenom} `;
  };

  return (
    <>
      <Head title={paiement?.id ? "Modifier le paiement" : "Nouveau paiement"} />
      
      <DashboardLayout activeRoute="/paiements">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {paiement?.id ? "Modifier le paiement" : "Nouveau paiement"}
              </h1>
              <p className="text-muted-foreground">
                {paiement?.id 
                  ? "Modifiez les informations de ce paiement"
                  : "Enregistrez un nouveau paiement"}
              </p>
            </div>
            <Link href="/paiements">
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
                  <Receipt className="h-5 w-5" />
                  Informations du paiement
                </CardTitle>
                <CardDescription>
                  Remplissez les détails de ce paiement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="reference">Référence *</Label>
                      <Input
                        id="reference"
                        value={data.reference}
                        onChange={(e) => setData('reference', e.target.value)}
                        placeholder="PAY-XXXXXX"
                        className={errors.reference ? 'border-destructive' : ''}
                        disabled={!!paiement?.id}
                      />
                      {errors.reference && (
                        <p className="text-sm text-destructive">{errors.reference}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_paiement">Date de paiement *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date_paiement"
                          type="date"
                          value={data.date_paiement}
                          onChange={(e) => setData('date_paiement', e.target.value)}
                          className={`pl-10 ${errors.date_paiement ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.date_paiement && (
                        <p className="text-sm text-destructive">{errors.date_paiement}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eleve_id">Élève (optionnel)</Label>
                      <Select
                        value={data.eleve_id?.toString() || ''}
                        onValueChange={(value) => setData('eleve_id', value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className={errors.eleve_id ? 'border-destructive' : ''}>
                          <User className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sélectionnez un élève" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>Non spécifié</SelectItem>
                          {eleves.map((eleve) => (
                            <SelectItem key={eleve.id} value={eleve.id.toString()}>
                              {getEleveLabel(eleve)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.eleve_id && (
                        <p className="text-sm text-destructive">{errors.eleve_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tranche_id">Tranche (optionnel)</Label>
                      <Select
                        value={data.tranche_id?.toString() || ''}
                        onValueChange={(value) => setData('tranche_id', value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className={errors.tranche_id ? 'border-destructive' : ''}>
                          <FileText className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sélectionnez une tranche" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>Non spécifiée</SelectItem>
                          {tranches.map((tranche) => (
                            <SelectItem key={tranche.id} value={tranche.id.toString()}>
                              {tranche.nom_tranche} - {formatMontant(tranche.montant)}
                              {tranche.configuration_frais && 
                                ` (${tranche.configuration_frais.nom_frais})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tranche_id && (
                        <p className="text-sm text-destructive">{errors.tranche_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mode_paiement">Mode de paiement *</Label>
                      <Select
                        value={data.mode_paiement}
                        onValueChange={(value: any) => setData('mode_paiement', value)}
                      >
                        <SelectTrigger className={errors.mode_paiement ? 'border-destructive' : ''}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Sélectionnez un mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="espèce">Espèce</SelectItem>
                          <SelectItem value="chèque">Chèque</SelectItem>
                          <SelectItem value="virement">Virement</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.mode_paiement && (
                        <p className="text-sm text-destructive">{errors.mode_paiement}</p>
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
                    </div>

                    {showChequeField && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="numero_cheque">Numéro de chèque *</Label>
                        <Input
                          id="numero_cheque"
                          value={data.numero_cheque || ''}
                          onChange={(e) => setData('numero_cheque', e.target.value)}
                          placeholder="N° du chèque"
                          className={errors.numero_cheque ? 'border-destructive' : ''}
                        />
                        {errors.numero_cheque && (
                          <p className="text-sm text-destructive">{errors.numero_cheque}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                      <Textarea
                        id="commentaire"
                        value={data.commentaire || ''}
                        onChange={(e) => setData('commentaire', e.target.value)}
                        placeholder="Notes ou observations..."
                        rows={3}
                        className={errors.commentaire ? 'border-destructive' : ''}
                      />
                      {errors.commentaire && (
                        <p className="text-sm text-destructive">{errors.commentaire}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Link href="/paiements">
                      <Button type="button" variant="outline">
                        Annuler
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? 'Enregistrement...' : paiement?.id ? 'Mettre à jour' : 'Enregistrer'}
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
                        {new Date(data.date_paiement).toLocaleDateString('fr-FR', {
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

                    {data.numero_cheque && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">N° Chèque:</span>
                        <span className="font-medium">{data.numero_cheque}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Enregistré par:</div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {auth.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{auth.user.name}</p>
                        <p className="text-xs text-muted-foreground">{auth.user.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedEleve && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Élève sélectionné
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium">
                        {selectedEleve.nom} {selectedEleve.prenom}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Référence: {selectedEleve.ref}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTranche && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Tranche sélectionnée
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="font-medium">{selectedTranche.nom_tranche}</div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Montant:</span>
                          <span className="font-medium">{formatMontant(selectedTranche.montant)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ordre:</span>
                          <span>#{selectedTranche.ordre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date limite:</span>
                          <span>
                            {new Date(selectedTranche.date_limite).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedTranche.configuration_frais && (
                      <div className="pt-3 border-t">
                        <div className="text-sm text-muted-foreground mb-1">Configuration:</div>
                        <div className="font-medium">
                          {selectedTranche.configuration_frais.nom_frais}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedTranche.configuration_frais.annee_scolaire}
                        </div>
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