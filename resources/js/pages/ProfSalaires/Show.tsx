import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, User, Clock, Calendar, FileText, Edit } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Professeur {
  id: number;
  name: string;
  email: string;
}

interface ProfSalaire {
  id: number;
  ref: string;
  professeur_id: number;
  type_salaire: 'horaire' | 'mensuel';
  taux_horaire: number | null;
  salaire_fixe: number | null;
  montant: number;
  formatted_montant: string;
  type_salaire_label: string;
  created_at: string;
  updated_at: string;
  professeur: Professeur;
}

interface ShowProfSalaireProps {
  profSalaire: ProfSalaire;
}

export default function ShowProfSalaire({ profSalaire }: ShowProfSalaireProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEstimations = () => {
    if (profSalaire.type_salaire === 'horaire' && profSalaire.taux_horaire) {
      const taux = profSalaire.taux_horaire;
      const mensuel = taux * 35 * 4.33;
      const annuel = mensuel * 12;
      return {
        mensuel: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(mensuel),
        annuel: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(annuel),
        horaire: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(taux)
      };
    } else if (profSalaire.type_salaire === 'mensuel' && profSalaire.salaire_fixe) {
      const mensuel = profSalaire.salaire_fixe;
      const annuel = mensuel * 12;
      const horaire = mensuel / (35 * 4.33);
      return {
        mensuel: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(mensuel).replace('$US', '$'),
        annuel: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(annuel).replace('$US', '$'),
        horaire: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(horaire).replace('$US', '$')
      };
    }
    return {
      mensuel: '0,00 $',
      annuel: '0,00 $',
      horaire: '0,00 $'
    };
  };

  const estimations = calculateEstimations();

  const getTypeSalaireBadge = () => {
    if (profSalaire.type_salaire === 'horaire') {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Horaire
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Mensuel
      </Badge>
    );
  };

  return (
    <>
      <Head title={`Détails du salaire - ${profSalaire.ref}`} />
      
      <DashboardLayout activeRoute="/prof-salaires">
        <PageHeader
          title="Détails du salaire"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Salaires', href: '/prof-salaires' },
            { label: profSalaire.ref, href: `/prof-salaires/${profSalaire.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/prof-salaires">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/prof-salaires/${profSalaire.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations de configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Référence</p>
                    <p className="font-medium font-mono">{profSalaire.ref}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Type de salaire</p>
                    <div>{getTypeSalaireBadge()}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <div className="text-2xl font-bold">
                    {profSalaire.formatted_montant}
                  </div>
                  {profSalaire.type_salaire === 'horaire' && (
                    <p className="text-sm text-muted-foreground">
                      Par heure travaillée
                    </p>
                  )}
                  {profSalaire.type_salaire === 'mensuel' && (
                    <p className="text-sm text-muted-foreground">
                      Salaire fixe mensuel
                    </p>
                  )}
                </div>

                <Separator />

                {/* Estimations */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Estimations</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Mensuel</p>
                      <p className="font-semibold">{estimations.mensuel}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Annuel</p>
                      <p className="font-semibold">{estimations.annuel}</p>
                    </div>
                  </div>
                  {profSalaire.type_salaire === 'mensuel' && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        Équivalent horaire (35h/semaine)
                      </p>
                      <p className="font-semibold">{estimations.horaire}/h</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations temporelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Créé le</p>
                    <p className="font-medium">{formatDate(profSalaire.created_at)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Dernière modification</p>
                    <p className="font-medium">{formatDate(profSalaire.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Professeur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Professeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {profSalaire.professeur.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{profSalaire.professeur.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {profSalaire.professeur.email}
                    </p>
                    <Link 
                      href={`/professeurs/${profSalaire.professeur.id}`}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Voir le profil →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/prof-salaires/${profSalaire.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier la configuration
                  </Button>
                </Link>
                <Link href="/prof-salaires" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à la liste
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}