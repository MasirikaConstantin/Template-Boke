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
  CheckCircle, 
  XCircle,
  Hash,
  Clock,
  CalendarDays
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

interface ConfigurationFraisShowProps {
  auth: any;
  frai: ConfigurationFrais;
}

export default function ConfigurationFraisShow({ auth, frai }: ConfigurationFraisShowProps) {
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
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  return (
    <>
      <Head title={`Détails: ${frai.nom_frais}`} />
      
      <DashboardLayout activeRoute="/configuration-frais">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{frai.nom_frais}</h1>
              <p className="text-muted-foreground">
                Détails de la configuration de frais
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/configuration-frais">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/configuration-frais/${frai.id}/edit`}>
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
                  <CreditCard className="h-5 w-5" />
                  Informations principales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Nom du frais
                    </div>
                    <div className="text-lg font-semibold">{frai.nom_frais}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Montant total
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatMontant(frai.montant_total)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Année scolaire
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{frai.annee_scolaire}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Statut
                    </div>
                    <Badge variant={frai.est_actif ? "default" : "secondary"} className="text-sm">
                      {frai.est_actif ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactif
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Référence unique
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    {frai.ref}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    {formatDate(frai.created_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Dernière modification
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {formatDate(frai.updated_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    ID
                  </div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {frai.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}