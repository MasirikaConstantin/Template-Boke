import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  CreditCard, 
  Hash,
  Clock,
  CalendarDays,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';

interface ConfigurationFrais {
  id: number;
  annee_scolaire: string;
  nom_frais: string;
  montant_total: number;
  est_actif: boolean;
  ref: string;
  created_at: string;
  updated_at: string;
}

interface Tranche {
  id: number;
  configuration_frai_id: number;
  nom_tranche: string;
  montant: number;
  date_limite: string;
  ordre: number;
  ref: string;
  created_at: string;
  updated_at: string;
  configuration_frais?: ConfigurationFrais;
}

interface TrancheShowProps {
  auth: any;
  tranche: Tranche;
}

export default function TrancheShow({ auth, tranche }: TrancheShowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
    }).format(montant);
  };

  const getDateStatus = () => {
    const today = new Date();
    const limite = new Date(tranche.date_limite);
    const diffTime = limite.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        label: 'Échue', 
        variant: 'destructive' as const,
        description: 'La date limite est dépassée'
      };
    } else if (diffDays <= 7) {
      return { 
        label: 'Bientôt', 
        variant: 'warning' as const,
        description: `Échéance dans ${diffDays} jour(s)`
      };
    } else if (diffDays <= 30) {
      return { 
        label: 'Proche', 
        variant: 'default' as const,
        description: `Échéance dans ${diffDays} jour(s)`
      };
    } else {
      return { 
        label: 'Loin', 
        variant: 'secondary' as const,
        description: `Échéance dans ${diffDays} jour(s)`
      };
    }
  };

  const dateStatus = getDateStatus();

  return (
    <>
      <Head title={`Détails: ${tranche.nom_tranche}`} />
      
      <DashboardLayout activeRoute="/tranches">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{tranche.nom_tranche}</h1>
              <p className="text-muted-foreground">
                Tranche #{tranche.ordre} - {formatMontant(tranche.montant)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/tranches">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/tranches/${tranche.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations de la tranche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Nom de la tranche
                    </div>
                    <div className="text-lg font-semibold">{tranche.nom_tranche}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Montant
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatMontant(tranche.montant)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Date limite
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {new Date(tranche.date_limite).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <Badge variant={dateStatus.variant} className="mt-1">
                          {dateStatus.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dateStatus.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Ordre
                    </div>
                    <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                      #{tranche.ordre}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Position dans le calendrier de paiement
                    </p>
                  </div>
                </div>

                <Separator />

                {tranche.configuration_frais && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Configuration de frais associée
                    </div>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">
                                {tranche.configuration_frais.nom_frais}
                              </h3>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>{tranche.configuration_frais.annee_scolaire}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">
                                  Total: {formatMontant(tranche.configuration_frais.montant_total)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {tranche.configuration_frais.est_actif ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-amber-500" />
                                )}
                                <span>
                                  {tranche.configuration_frais.est_actif ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/configuration-frais/${tranche.configuration_frais.id}`}>
                            <Button variant="outline" size="sm">
                              Voir
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Référence unique
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm bg-muted p-3 rounded">
                    <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="break-all">{tranche.ref}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Métadonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Créé le
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {formatDate(tranche.created_at)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Dernière modification
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {formatDate(tranche.updated_at)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      ID
                    </div>
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {tranche.id}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/tranches/${tranche.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier cette tranche
                    </Button>
                  </Link>
                  
                  {tranche.configuration_frais && (
                    <Link href={`/configuration-frais/${tranche.configuration_frais.id}`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Voir la configuration
                      </Button>
                    </Link>
                  )}

                  <Link href="/tranches" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour à la liste
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pourcentage du total</span>
                    <span className="font-semibold">
                      {tranche.configuration_frais 
                        ? `${((tranche.montant / tranche.configuration_frais.montant_total) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jours restants</span>
                    <span className="font-semibold">
                      {Math.ceil((new Date(tranche.date_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>

                  <div className="pt-3">
                    <div className="text-sm text-muted-foreground mb-1">Échéance</div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      dateStatus.variant === 'destructive' ? 'bg-destructive' :
                      dateStatus.variant === 'warning' ? 'bg-amber-500' :
                      'bg-primary'
                    }`} style={{
                      width: `${Math.min(100, Math.max(0, 
                        (new Date(tranche.date_limite).getTime() - new Date().getTime()) / 
                        (30 * 24 * 60 * 60 * 1000) * 100
                      ))}%`
                    }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}