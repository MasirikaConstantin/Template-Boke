import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CreditCard, 
  AlertCircle, 
  User, 
  DollarSign,
  CalendarIcon,
  Calculator,
  Clock,
  TrendingUp,
  Percent,
  Download
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Professeur {
  id: number;
  nom: string;
  email: string;
  prof_salaire?: {
    id: number;
    type_salaire: 'horaire' | 'mensuel';
    taux_horaire: number | null;
    salaire_fixe: number | null;
  };
}

interface CreatePaiementSalaireProps {
  professeurs: Professeur[];
  today: string;
  periode_courante: string;
}

interface CalculAutomatique {
  salaire_base: number;
  avances_deduites: number;
  heures_travaillees: number;
  net_a_payer: number;
  periode_label: string;
}

export default function CreatePaiementSalaire({ 
  professeurs, 
  today, 
  periode_courante 
}: CreatePaiementSalaireProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    professeur_id: '',
    type_paiement: 'normal',
    montant: '',
    date_paiement: today,
    periode: periode_courante,
    statut: 'paye',
    avance_id: '',
    heures_travaillees: '',
    retenues: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(today));
  const [selectedProfesseur, setSelectedProfesseur] = useState<Professeur | null>(null);
  const [calculAutomatique, setCalculAutomatique] = useState<CalculAutomatique | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (data.professeur_id) {
      const prof = professeurs.find(p => p.id.toString() === data.professeur_id);
      setSelectedProfesseur(prof || null);
    }
  }, [data.professeur_id, professeurs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/paiement-salaires');
  };

  const handleSetDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setData('date_paiement', format(date, 'yyyy-MM-dd'));
    }
  };

  const handleCalculerAutomatique = async () => {
    if (!data.professeur_id || !data.periode) {
      alert('Veuillez sélectionner un professeur et une période');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await router.post('/paiement-salaires/calculer', {
        professeur_id: data.professeur_id,
        periode: data.periode,
      });

      if (response.data) {
        setCalculAutomatique(response.data);
        setData('montant', response.data.net_a_payer.toString());
        setData('heures_travaillees', response.data.heures_travaillees.toString());
      }
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert('Erreur lors du calcul automatique');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount).replace('$US', '$');
  };

  return (
    <>
      <Head title="Créer un paiement de salaire" />
      
      <DashboardLayout activeRoute="/depenses">
        <PageHeader
          title="Nouveau paiement"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Finances', href: '#' },
            { label: 'Paiements', href: '/paiement-salaires' },
            { label: 'Créer', href: '/paiement-salaires/create' },
          ]}
          actions={
            <Link href="/paiement-salaires">
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
              <CreditCard className="h-5 w-5" />
              Nouveau paiement de salaire
            </CardTitle>
            <CardDescription>
              Enregistrez un paiement de salaire pour un professeur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur */}
              {(errors.professeur_id || errors.montant) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.professeur_id || errors.montant}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="infos" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="calcul">Calcul</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                </TabsList>

                <TabsContent value="infos" className="space-y-6 pt-6">
                  {/* Date de paiement */}
                  <div className="space-y-4">
                    <Label>Date de paiement *</Label>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? (
                                format(selectedDate, 'dd MMMM yyyy', { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleSetDate}
                              locale={fr}
                              className="rounded-md border"
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <input type="hidden" name="date_paiement" value={data.date_paiement} />
                        {selectedDate && (
                          <div className="mt-2">
                            <div className="text-sm font-medium">
                              {format(selectedDate, 'EEEE', { locale: fr })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.date_paiement && (
                      <p className="text-sm text-destructive">{errors.date_paiement}</p>
                    )}
                  </div>

                  {/* Professeur */}
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
                                {prof.prof_salaire && (
                                  <div className="text-xs text-muted-foreground">
                                    {prof.prof_salaire.type_salaire === 'horaire'
                                      ? `${formatCurrency(prof.prof_salaire.taux_horaire || 0)}/h`
                                      : `${formatCurrency(prof.prof_salaire.salaire_fixe || 0)}/mois`
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sélectionnez le professeur concerné
                    </p>
                    {errors.professeur_id && (
                      <p className="text-sm text-destructive">{errors.professeur_id}</p>
                    )}
                  </div>

                  {/* Type de paiement */}
                  <div className="space-y-4">
                    <Label htmlFor="type_paiement">Type de paiement *</Label>
                    <Select
                      value={data.type_paiement}
                      onValueChange={value => {
                        setData('type_paiement', value);
                        if (value !== 'normal') {
                          setData('periode', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Salaire normal</SelectItem>
                        <SelectItem value="avance">Avance</SelectItem>
                        <SelectItem value="regularisation">Régularisation</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {data.type_paiement === 'normal' && 'Paiement mensuel régulier'}
                      {data.type_paiement === 'avance' && 'Avance sur salaire'}
                      {data.type_paiement === 'regularisation' && 'Paiement de régularisation'}
                    </p>
                  </div>

                  {/* Période (uniquement pour salaire normal) */}
                  {data.type_paiement === 'normal' && (
                    <div className="space-y-4">
                      <Label htmlFor="periode">Période *</Label>
                      <div className="relative">
                        <Input
                          id="periode"
                          type="month"
                          value={data.periode}
                          onChange={e => setData('periode', e.target.value)}
                          className="pl-10"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {data.periode && (
                        <div className="text-sm text-muted-foreground">
                          Période sélectionnée: {new Date(data.periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </div>
                      )}
                      {errors.periode && (
                        <p className="text-sm text-destructive">{errors.periode}</p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="calcul" className="space-y-6 pt-6">
                  {/* Calcul automatique */}
                  {data.type_paiement === 'normal' && data.professeur_id && data.periode && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Calcul automatique</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCalculerAutomatique}
                          disabled={isCalculating}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          {isCalculating ? 'Calcul en cours...' : 'Calculer automatiquement'}
                        </Button>
                      </div>

                      {calculAutomatique && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Résultat du calcul
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Salaire de base</p>
                              <p className="font-medium">
                                {formatCurrency(calculAutomatique.salaire_base)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avances à déduire</p>
                              <p className="font-medium text-red-600">
                                -{formatCurrency(calculAutomatique.avances_deduites)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Heures travaillées</p>
                              <p className="font-medium">
                                {calculAutomatique.heures_travaillees}h
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Net à payer</p>
                              <p className="font-medium text-green-600 text-lg">
                                {formatCurrency(calculAutomatique.net_a_payer)}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Période: {calculAutomatique.periode_label}
                          </div>
                        </div>
                      )}

                      {/* Heures travaillées */}
                      <div className="space-y-4">
                        <Label htmlFor="heures_travaillees">Heures travaillées</Label>
                        <div className="relative">
                          <Input
                            id="heures_travaillees"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.heures_travaillees}
                            onChange={e => setData('heures_travaillees', e.target.value)}
                            placeholder="0,00"
                            className="pl-10"
                          />
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Laisser vide pour utiliser le calcul automatique
                        </p>
                      </div>

                      {/* Retenues */}
                      <div className="space-y-4">
                        <Label htmlFor="retenues">Retenues diverses</Label>
                        <div className="relative">
                          <Input
                            id="retenues"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.retenues}
                            onChange={e => setData('retenues', e.target.value)}
                            placeholder="0,00"
                            className="pl-10"
                          />
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Montant des retenues diverses (cotisations, etc.)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Montant pour avance/régularisation */}
                  {(data.type_paiement === 'avance' || data.type_paiement === 'regularisation') && (
                    <div className="space-y-4">
                      <Label htmlFor="montant">Montant *</Label>
                      <div className="relative">
                        <Input
                          id="montant"
                          type="number"
                          step="0.01"
                          min="0"
                          value={data.montant}
                          onChange={e => setData('montant', e.target.value)}
                          placeholder="0,00"
                          className="pl-10 text-lg"
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Montant du {data.type_paiement === 'avance' ? 'de l\'avance' : 'de la régularisation'}
                      </p>
                      {errors.montant && (
                        <p className="text-sm text-destructive">{errors.montant}</p>
                      )}
                    </div>
                  )}

                  {/* Montant final */}
                  <div className="space-y-4">
                    <Label htmlFor="montant_final">Montant final à payer *</Label>
                    <div className="relative">
                      <Input
                        id="montant_final"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.montant}
                        onChange={e => setData('montant', e.target.value)}
                        placeholder="0,00"
                        className="pl-10 text-lg"
                        disabled={data.type_paiement === 'normal' && !!calculAutomatique}
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {data.montant && (
                      <div className="text-lg font-semibold text-green-600">
                        Net à payer: {formatCurrency(parseFloat(data.montant) || 0)}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6 pt-6">
                  {/* Statut */}
                  <div className="space-y-4">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={data.statut}
                      onValueChange={value => setData('statut', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Le statut "Payé" créera automatiquement une dépense dans le système
                    </p>
                  </div>

                  {/* Informations complémentaires */}
                  {selectedProfesseur?.prof_salaire && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Configuration de salaire</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type de salaire</p>
                          <p className="font-medium">
                            {selectedProfesseur.prof_salaire.type_salaire === 'horaire' ? 'Horaire' : 'Mensuel'}
                          </p>
                        </div>
                        {selectedProfesseur.prof_salaire.type_salaire === 'horaire' && (
                          <div>
                            <p className="text-muted-foreground">Taux horaire</p>
                            <p className="font-medium">
                              {formatCurrency(selectedProfesseur.prof_salaire.taux_horaire || 0)}/h
                            </p>
                          </div>
                        )}
                        {selectedProfesseur.prof_salaire.type_salaire === 'mensuel' && (
                          <div>
                            <p className="text-muted-foreground">Salaire fixe</p>
                            <p className="font-medium">
                              {formatCurrency(selectedProfesseur.prof_salaire.salaire_fixe || 0)}/mois
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Avertissement */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {data.statut === 'paye' 
                        ? 'Une dépense sera automatiquement créée dans le système lors de l\'enregistrement.'
                        : 'Le paiement sera enregistré comme en attente. Vous pourrez le marquer comme payé plus tard.'
                      }
                    </AlertDescription>
                  </Alert>

                  {/* Récapitulatif */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Récapitulatif</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Professeur:</span>
                        <span className="font-medium">
                          {selectedProfesseur?.nom || 'Non sélectionné'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type de paiement:</span>
                        <span className="font-medium">
                          {data.type_paiement === 'normal' && 'Salaire normal'}
                          {data.type_paiement === 'avance' && 'Avance'}
                          {data.type_paiement === 'regularisation' && 'Régularisation'}
                        </span>
                      </div>
                      {data.type_paiement === 'normal' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Période:</span>
                          <span className="font-medium">
                            {data.periode 
                              ? new Date(data.periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                              : 'Non spécifiée'
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date de paiement:</span>
                        <span className="font-medium">
                          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Non spécifiée'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant:</span>
                        <span className="font-medium text-lg">
                          {data.montant ? formatCurrency(parseFloat(data.montant)) : '0,00 €'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Statut:</span>
                        <span className="font-medium">
                          {data.statut === 'paye' ? 'Payé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/paiement-salaires">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Enregistrement en cours...' : 'Enregistrer le paiement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}