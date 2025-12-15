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
  CalendarDays, 
  AlertCircle, 
  User, 
  Clock, 
  CheckCircle,
  CalendarIcon, 
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CreatePresenceProps {
  professeurs: Array<{
    id: number;
    nom: string;
    email: string;
  }>;
  today: string;
}

export default function CreatePresence({ professeurs, today }: CreatePresenceProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    professeur_id: '',
    date: today,
    heure_arrivee: '',
    heure_depart: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(today));
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Mettre à jour l'heure actuelle
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm'));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Mettre à jour chaque minute

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/presences');
  };

  const handleSetCurrentTime = (field: 'heure_arrivee' | 'heure_depart') => {
    setData(field, currentTime);
  };

  const handleSetDate = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setData('date', format(date, 'yyyy-MM-dd'));
    }
  };

  const getDayStatus = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { label: 'Week-end', color: 'text-muted-foreground' };
    }
    return { label: 'Jour ouvré', color: 'text-green-600' };
  };

  const dayStatus = selectedDate ? getDayStatus(selectedDate) : { label: '', color: '' };

  return (
    <>
      <Head title="Enregistrer une présence" />
      
      <DashboardLayout activeRoute="/presences">
        <PageHeader
          title="Nouvelle présence"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Présences', href: '/presences' },
            { label: 'Créer', href: '/presences/create' },
          ]}
          actions={
            <Link href="/presences">
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
              <CalendarDays className="h-5 w-5" />
              Enregistrer une présence
            </CardTitle>
            <CardDescription>
              Enregistrez la présence d'un professeur pour une journée spécifique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages d'erreur */}
              {(errors.professeur_id || errors.date) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.professeur_id || errors.date}
                  </AlertDescription>
                </Alert>
              )}

              {errors.heure_depart && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.heure_depart}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="infos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="heures">Horaires</TabsTrigger>
                </TabsList>

                <TabsContent value="infos" className="space-y-6 pt-6">
                  {/* Date */}
                  <div className="space-y-4">
                    <Label>Date *</Label>
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
                              disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                            />
                          </PopoverContent>
                        </Popover>
                        <input type="hidden" name="date" value={data.date} />
                        {selectedDate && (
                          <div className="mt-2">
                            <div className={`text-sm font-medium ${dayStatus.color}`}>
                              {dayStatus.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(selectedDate, 'EEEE', { locale: fr })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Heure actuelle */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Heure actuelle</span>
                        </div>
                        <div className="text-2xl font-bold">{currentTime}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Mise à jour automatique
                        </div>
                      </div>
                    </div>
                    {errors.date && (
                      <p className="text-sm text-destructive">{errors.date}</p>
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

                  {/* Avertissement */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Une présence ne peut être enregistrée qu'une seule fois par professeur et par jour.
                      Vérifiez qu'aucune présence n'existe déjà pour cette date.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="heures" className="space-y-6 pt-6">
                  {/* Heure d'arrivée */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="heure_arrivee">Heure d'arrivée</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetCurrentTime('heure_arrivee')}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Maintenant ({currentTime})
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="heure_arrivee"
                        type="time"
                        value={data.heure_arrivee}
                        onChange={e => setData('heure_arrivee', e.target.value)}
                        className="pl-10"
                      />
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Laissez vide si le professeur est absent
                    </p>
                    {errors.heure_arrivee && (
                      <p className="text-sm text-destructive">{errors.heure_arrivee}</p>
                    )}
                  </div>

                  {/* Heure de départ */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="heure_depart">Heure de départ</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetCurrentTime('heure_depart')}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Maintenant ({currentTime})
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="heure_depart"
                        type="time"
                        value={data.heure_depart}
                        onChange={e => setData('heure_depart', e.target.value)}
                        className="pl-10"
                        disabled={!data.heure_arrivee}
                      />
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {data.heure_arrivee && data.heure_depart && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Temps de présence:</span>
                          <span className="font-medium">
                            {(() => {
                              const arrivee = new Date(`2000-01-01T${data.heure_arrivee}`);
                              const depart = new Date(`2000-01-01T${data.heure_depart}`);
                              const diffMs = depart.getTime() - arrivee.getTime();
                              const diffHours = diffMs / (1000 * 60 * 60);
                              return `${diffHours.toFixed(2)} heures`;
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Optionnel - Définit la fin de la journée de travail
                    </p>
                    {errors.heure_depart && (
                      <p className="text-sm text-destructive">{errors.heure_depart}</p>
                    )}
                  </div>

                  {/* Statut de la journée */}
                  <div className="space-y-2">
                    <Label>Statut de la journée</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Card
                        className={`cursor-pointer transition-all ${
                          !data.heure_arrivee && !data.heure_depart
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'hover:border-border'
                        }`}
                        onClick={() => {
                          setData('heure_arrivee', '');
                          setData('heure_depart', '');
                        }}
                      >
                        <CardContent className="p-4 flex flex-col items-center">
                          <XCircle className="h-8 w-8 text-red-500 mb-2" />
                          <div className="font-medium">Absent</div>
                          <div className="text-xs text-muted-foreground text-center">
                            Non présent ce jour
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${
                          data.heure_arrivee && !data.heure_depart
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'hover:border-border'
                        }`}
                        onClick={() => {
                          setData('heure_arrivee', currentTime);
                          setData('heure_depart', '');
                        }}
                      >
                        <CardContent className="p-4 flex flex-col items-center">
                          <Clock className="h-8 w-8 text-amber-500 mb-2" />
                          <div className="font-medium">Présent</div>
                          <div className="text-xs text-muted-foreground text-center">
                            Arrivé, en cours
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${
                          data.heure_arrivee && data.heure_depart
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'hover:border-border'
                        }`}
                        onClick={() => {
                          setData('heure_arrivee', '08:00');
                          setData('heure_depart', '17:00');
                        }}
                      >
                        <CardContent className="p-4 flex flex-col items-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                          <div className="font-medium">Complète</div>
                          <div className="text-xs text-muted-foreground text-center">
                            Journée terminée
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Link href="/presences">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Enregistrement en cours...' : 'Enregistrer la présence'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}