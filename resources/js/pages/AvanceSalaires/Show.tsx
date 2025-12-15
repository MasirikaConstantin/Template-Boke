import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  DollarSign, 
  CalendarDays,
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { dashboard } from '@/routes';
import professeurs from '@/routes/professeurs';

interface Professeur {
  id: number;
  name: string;
  email: string;
}

interface Approbateur {
  id: number;
  name: string;
}

interface AvanceSalaire {
  id: number;
  ref: string;
  professeur_id: number;
  montant: number;
  date_avance: string;
  statut: 'demandee' | 'approuvee' | 'payee' | 'deduite';
  statut_label: string;
  statut_color: string;
  formatted_montant: string;
  formatted_date: string;
  raison_rejet?: string;
  approuve_par?: number;
  approuve_le?: string;
  created_at: string;
  updated_at: string;
  professeur: Professeur;
  approbateur?: Approbateur;
}

interface ShowAvanceSalaireProps {
  avance: AvanceSalaire;
}

export default function ShowAvanceSalaire({ avance }: ShowAvanceSalaireProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutIcon = () => {
    const icons = {
      demandee: Clock,
      approuvee: CheckCircle,
      payee: DollarSign,
      deduite: CreditCard,
    };
    const Icon = icons[avance.statut] || AlertCircle;
    return <Icon className="h-5 w-5" />;
  };

  const getStatutBadge = () => {
    const variants = {
      demandee: { variant: 'warning' as const },
      approuvee: { variant: 'info' as const },
      payee: { variant: 'success' as const },
      deduite: { variant: 'secondary' as const },
    };

    const variant = variants[avance.statut] || { variant: 'outline' as const };

    return (
      <Badge variant={variant.variant} className="flex items-center gap-1">
        {getStatutIcon()}
        {avance.statut_label}
      </Badge>
    );
  };

  const canEdit = avance.statut === 'demandee' || avance.statut === 'approuvee';
  const canApprove = avance.statut === 'demandee';
  const canPay = avance.statut === 'approuvee';

  const handleApprove = () => {
    if (confirm(`Approuver l'avance de ${avance.formatted_montant} ?`)) {
      // Appel API pour approuver
    }
  };

  const handlePay = () => {
    if (confirm(`Marquer comme payée l'avance de ${avance.formatted_montant} ?`)) {
      // Appel API pour marquer comme payée
    }
  };

  return (
    <>
      <Head title={`Détails de l'avance - ${avance.ref}`} />
      
      <DashboardLayout activeRoute="/depenses">
        <PageHeader
          title="Détails de l'avance"
          breadcrumb={[
            { label: 'Dashboard', href: dashboard().url },
            { label: 'Professeurs', href: professeurs.index().url },
            { label: 'Avances', href: '/avance-salaires' },
            { label: avance.ref, href: `/avance-salaires/${avance.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/avance-salaires">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {canEdit && (
                <Link href={`/avance-salaires/${avance.id}/edit`}>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              )}
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Informations de l'avance
                  </div>
                  {getStatutBadge()}
                </CardTitle>
                <CardDescription>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Montant</p>
                    <p className="text-2xl font-bold">{avance.formatted_montant}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Date de l'avance</p>
                    <div className="font-medium flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(avance.date_avance)}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Historique du statut */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Historique</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Créée le:</span>
                      <span className="font-medium">{formatDateTime(avance.created_at)}</span>
                    </div>
                    {avance.approuve_le && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Approuvée le:</span>
                        <span className="font-medium">{formatDateTime(avance.approuve_le)}</span>
                      </div>
                    )}
                    {avance.updated_at !== avance.created_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Dernière modification:</span>
                        <span className="font-medium">{formatDateTime(avance.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Raison du rejet */}
                {avance.raison_rejet && (
                  <>
                    <Separator />
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium">Raison du rejet:</p>
                        <p>{avance.raison_rejet}</p>
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informations du professeur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Professeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {avance.professeur.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{avance.professeur.nom}</p>
                    <p className="text-muted-foreground">{avance.professeur.email}</p>
                    <Link 
                      href={`/professeurs/${avance.professeur.id}`}
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      Voir le profil →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations d'approbation */}
            {avance.approbateur && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Approbation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {avance.approbateur.nom.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{avance.approbateur.nom}</p>
                        <p className="text-sm text-muted-foreground">Approbateur</p>
                      </div>
                    </div>
                    {avance.approuve_le && (
                      <div className="text-sm text-muted-foreground">
                        Approuvée le {formatDate(avance.approuve_le)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {canApprove && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleApprove}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver l'avance
                    </Button>
                  )}
                  {canPay && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handlePay}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Marquer comme payée
                    </Button>
                  )}
                  {canEdit && (
                    <Link href={`/avance-salaires/${avance.id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" className="w-full justify-start">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Link href="/avance-salaires" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour à la liste
                    </Button>
                  </Link>
                  <Link href="/avance-salaires/create" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Nouvelle avance
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Statut et informations */}
            <Card>
              <CardHeader>
                <CardTitle>Statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut actuel:</span>
                  {getStatutBadge()}
                </div>
                
               
                <Separator />

                {/* Workflow d'avance */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Workflow d'avance</p>
                  <div className="space-y-1">
                    {['demandee', 'approuvee', 'payee', 'deduite'].map((statut, index) => {
                      const isActive = avance.statut === statut;
                      const isCompleted = ['demandee', 'approuvee', 'payee', 'deduite']
                        .indexOf(avance.statut) >= index;

                      return (
                        <div key={statut} className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? isActive ? 'bg-primary' : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}>
                            {isCompleted && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className={`text-sm ${
                            isActive ? 'font-medium' : 'text-muted-foreground'
                          }`}>
                            {statut === 'demandee' && 'Demandée'}
                            {statut === 'approuvee' && 'Approuvée'}
                            {statut === 'payee' && 'Payée'}
                            {statut === 'deduite' && 'Déduite'}
                          </span>
                        </div>
                      );
                    })}
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