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
    Percent
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
        type_salaire: 'horaire' | 'mensuel';
        taux_horaire: number | null;
        salaire_fixe: number | null;
    };
}

interface CreateAvanceSalaireProps {
    professeurs: Professeur[];
    today: string;
}

export default function CreateAvanceSalaire({ professeurs, today }: CreateAvanceSalaireProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        professeur_id: '',
        montant: '',
        date_avance: today,
        statut: 'demandee',
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(today));
    const [selectedProfesseur, setSelectedProfesseur] = useState<Professeur | null>(null);
    const [maxAvance, setMaxAvance] = useState<number>(0);

    useEffect(() => {
        if (!data.professeur_id) return;

        const prof = professeurs.find(
            p => p.id.toString() === data.professeur_id
        );

        setSelectedProfesseur(prof || null);

        const salaire = prof?.salaires;
        if (!salaire) return;

        const salaireMensuel =
            salaire.type_salaire === 'mensuel'
                ? Number(salaire.salaire_fixe ?? 0)
                : Number(salaire.taux_horaire ?? 0) * 35 * 4.33;

        setMaxAvance(salaireMensuel * 0.5); // 50% du salaire
    }, [data.professeur_id, professeurs]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/avance-salaires');
    };

    const handleSetDate = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setData('date_avance', format(date, 'yyyy-MM-dd'));
        }
    };

    const handleMontantChange = (value: string) => {
        // Formater le montant avec deux décimales
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        setData('montant', numericValue.toFixed(2));
    };

    const handlePourcentageChange = (percentage: number) => {
        if (maxAvance > 0) {
            const montant = (maxAvance * percentage) / 100;
            setData('montant', montant.toFixed(2));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount).replace('$US', '$');
    };
    console.log(professeurs, maxAvance);
    return (
        <>
            <Head title="Demander une avance sur salaire" />

            <DashboardLayout activeRoute="/avance-salaires">
                <PageHeader
                    title="Demander une avance"
                    breadcrumb={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Finances', href: '#' },
                        { label: 'Avances', href: '/avance-salaires' },
                        { label: 'Demander', href: '/avance-salaires/create' },
                    ]}
                    actions={
                        <Link href="/avance-salaires">
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
                            Nouvelle demande d'avance
                        </CardTitle>
                        <CardDescription>
                            Remplissez les informations pour demander une avance sur salaire
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Messages d'erreur */}
                            {(errors.professeur_id || errors.montant || errors.date_avance) && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {errors.professeur_id || errors.montant || errors.date_avance}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Tabs defaultValue="infos" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="infos">Informations</TabsTrigger>
                                    <TabsTrigger value="details">Détails</TabsTrigger>
                                </TabsList>

                                <TabsContent value="infos" className="space-y-6 pt-6">
                                    {/* Date */}
                                    <div className="space-y-4">
                                        <Label>Date de l'avance *</Label>
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
                                                <input type="hidden" name="date_avance" value={data.date_avance} />
                                                {selectedDate && (
                                                    <div className="mt-2">
                                                        <div className="text-sm font-medium">
                                                            {format(selectedDate, 'EEEE', { locale: fr })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {errors.date_avance && (
                                            <p className="text-sm text-destructive">{errors.date_avance}</p>
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
                                                                        Salaire: {formatCurrency(
                                                                            prof.prof_salaire.type_salaire === 'horaire'
                                                                                ? (prof.prof_salaire.taux_horaire || 0) * 35 * 4.33
                                                                                : (prof.prof_salaire.salaire_fixe || 0)
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Sélectionnez le professeur demandeur
                                        </p>
                                        {errors.professeur_id && (
                                            <p className="text-sm text-destructive">{errors.professeur_id}</p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="details" className="space-y-6 pt-6">
                                    {/* Informations sur le salaire */}
                                    {selectedProfesseur?.prof_salaire && (
                                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Calculator className="h-4 w-4" />
                                                Information sur le salaire
                                            </h4>
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
                                                <div>
                                                    <p className="text-muted-foreground">Salaire mensuel estimé</p>
                                                    <p className="font-medium">
                                                        {formatCurrency(
                                                            selectedProfesseur.prof_salaire.type_salaire === 'horaire'
                                                                ? (selectedProfesseur.prof_salaire.taux_horaire || 0) * 35 * 4.33
                                                                : (selectedProfesseur.prof_salaire.salaire_fixe || 0)
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Avance maximum</p>
                                                    <p className="font-medium text-green-600">
                                                        {formatCurrency(maxAvance)} (50%)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Montant */}
                                    <div className="space-y-4">
                                        <Label htmlFor="montant">Montant de l'avance *</Label>
                                        <div className="relative">
                                            <Input
                                                id="montant"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={maxAvance}
                                                value={data.montant}
                                                onChange={(e) => handleMontantChange(e.target.value)}
                                                placeholder="0,00"
                                                className="pl-10 text-lg"
                                            />
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>

                                        {/* Boutons de pourcentage rapide */}
                                        {maxAvance > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Sélection rapide</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {[10, 25, 50, 75].map((percentage) => (
                                                        <Button
                                                            key={percentage}
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePourcentageChange(percentage)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Percent className="h-3 w-3" />
                                                            {percentage}%
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {data.montant && maxAvance > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Pourcentage du maximum:</span>
                                                    <span className={`font-medium ${parseFloat(data.montant) > maxAvance ? 'text-red-600' : 'text-green-600'}`}>
                                                        {((parseFloat(data.montant) / maxAvance) * 100).toFixed(1)}%
                                                    </span>
                                                </div>

                                                {parseFloat(data.montant) > maxAvance ? (
                                                    <Alert variant="destructive">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>
                                                            Le montant dépasse la limite autorisée de {formatCurrency(maxAvance)}
                                                        </AlertDescription>
                                                    </Alert>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                        Reste disponible: {formatCurrency(maxAvance - parseFloat(data.montant))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            Maximum: {formatCurrency(maxAvance)} (50% du salaire mensuel)
                                        </p>
                                        {errors.montant && (
                                            <p className="text-sm text-destructive">{errors.montant}</p>
                                        )}
                                    </div>

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
                                                <SelectItem value="demandee">Demandée</SelectItem>
                                                <SelectItem value="approuvee">Approuvée</SelectItem>
                                                <SelectItem value="payee">Payée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Par défaut, l'avance est créée avec le statut "Demandée"
                                        </p>
                                    </div>

                                    {/* Avertissement */}
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            L'avance sera automatiquement déduite du prochain salaire du professeur.
                                            Une dépense sera créée dans le système lors du paiement.
                                        </AlertDescription>
                                    </Alert>
                                </TabsContent>
                            </Tabs>

                            {/* Boutons d'action */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t">
                                <Link href="/avance-salaires">
                                    <Button type="button" variant="outline">
                                        Annuler
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing || (data.montant && parseFloat(data.montant) > maxAvance)}
                                >
                                    {processing ? 'Enregistrement en cours...' : 'Enregistrer la demande'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </DashboardLayout>
        </>
    );
}