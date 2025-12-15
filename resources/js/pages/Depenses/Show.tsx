import React, { useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Wallet,
  Folder,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Printer,
  TrendingDown,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { useReactToPrint } from 'react-to-print';
import PrintDepense from './PrintDepense';

interface Approbation {
  id: number;
  decision: string;
  commentaire: string | null;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface Depense {
  id: number;
  budget_id: number;
  categorie_depense_id: number;
  user_id: number;
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
  created_at: string;
  updated_at: string;
  budget?: {
    id: number;
    nom_complet: string;
    montant_alloue: number;
    montant_depense: number;
    montant_restant: number;
  };
  categorie?: {
    id: number;
    nom_categorie: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  approbations?: Approbation[];
}

interface DepenseShowProps {
  auth: any;
  depense: Depense;
}

export default function DepenseShow({ auth, depense }: DepenseShowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const getStatutBadge = (statut: string) => {
    const badges = {
      brouillon: { variant: 'secondary' as const, icon: <FileText className="h-4 w-4 mr-1" /> },
      en_attente: { variant: 'warning' as const, icon: <Clock className="h-4 w-4 mr-1" /> },
      approuve: { variant: 'default' as const, icon: <CheckCircle className="h-4 w-4 mr-1" /> },
      rejete: { variant: 'destructive' as const, icon: <XCircle className="h-4 w-4 mr-1" /> },
      paye: { variant: 'success' as const, icon: <CheckCircle className="h-4 w-4 mr-1" /> },
    };

    const badge = badges[statut] || { variant: 'secondary' as const, icon: null };
    const label = statut.charAt(0).toUpperCase() + statut.slice(1).replace('_', ' ');

    return (
      <Badge variant={badge.variant} className="text-sm">
        {badge.icon}
        {label}
      </Badge>
    );
  };

  const getDecisionBadge = (decision: string) => {
    const badges = {
      approuve: { variant: 'default' as const, label: 'Approuvé' },
      rejete: { variant: 'destructive' as const, label: 'Rejeté' },
      modifie: { variant: 'secondary' as const, label: 'Modifié' },
    };

    const badge = badges[decision] || { variant: 'secondary' as const, label: 'Inconnu' };

    return (
      <Badge variant={badge.variant}>
        {badge.label}
      </Badge>
    );
  };

  const handleApprobation = (decision: 'approuve' | 'rejete') => {
    if (confirm(`Êtes-vous sûr de vouloir ${decision === 'approuve' ? 'approuver' : 'rejeter'} cette dépense ?`)) {
      router.post(`/depenses/${depense.id}/approuver`, {
        decision,
        commentaire: prompt('Commentaire (optionnel):') || '',
      });
    }
  };

  const handleMarquerCommePaye = () => {
    if (confirm('Marquer cette dépense comme payée ?')) {
      router.post(`/depenses/${depense.id}/marquer-comme-paye`);
    }
  };
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,   // nouvelle API
    documentTitle: `Depense_${depense.reference}`,
  });



  return (
    <>
      <Head title={`Dépense: ${depense.reference}`} />

      <DashboardLayout activeRoute="/depenses">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{depense.libelle}</h1>
              <p className="text-muted-foreground">
                {depense.reference} • {formatMontant(depense.montant)} • {formatDate(depense.date_depense)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>

              <Link href="/depenses">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/depenses/${depense.id}/edit`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Détails
              </TabsTrigger>
              <TabsTrigger value="approbations" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approbations
                {depense.approbations && (
                  <Badge variant="outline" className="ml-1">
                    {depense.approbations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Informations principales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Référence
                        </div>
                        <div className="font-mono text-lg font-semibold">
                          {depense.reference}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Montant
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatMontant(depense.montant)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Statut
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatutBadge(depense.statut)}
                          {depense.statut === 'en_attente' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprobation('approuve')}
                              >
                                Approuver
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleApprobation('rejete')}
                              >
                                Rejeter
                              </Button>
                            </div>
                          )}
                          {depense.statut === 'approuve' && (
                            <Button
                              size="sm"
                              onClick={handleMarquerCommePaye}
                            >
                              Marquer comme payée
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Date de dépense
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(depense.date_depense)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Mode de paiement
                        </div>
                        <div className="capitalize font-medium">
                          {depense.mode_paiement}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Bénéficiaire
                        </div>
                        <div className="font-medium">
                          {depense.beneficiaire}
                        </div>
                      </div>

                      {depense.numero_piece && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Numéro de pièce
                          </div>
                          <div className="font-medium">
                            {depense.numero_piece}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {depense?.budget && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Budget</h3>
                          </div>
                          <div className="space-y-2 pl-7">
                            <div>
                              <div className="font-medium">{depense.budget.nom_complet}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Alloué: {formatMontant(depense.budget.montant_alloue)}</div>
                                <div>Dépensé: {formatMontant(depense.budget.montant_depense)}</div>
                                <div>Restant: {formatMontant(depense.budget.montant_restant)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {depense.categorie && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Folder className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Catégorie</h3>
                          </div>
                          <div className="space-y-2 pl-7">
                            <div>
                              <div className="font-medium">{depense.categorie.nom_categorie}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {depense.description && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Description
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="whitespace-pre-wrap">{depense.description}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {depense.fichier_joint && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Fichier joint
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <FileText className="h-8 w-8" />
                            <div className="flex-1">
                              <div className="font-medium">Document joint</div>
                              <div className="text-sm text-muted-foreground">
                                {depense.fichier_joint.split('/').pop()}
                              </div>
                            </div>
                            <a
                              href={`/storage/${depense.fichier_joint}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </a>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Enregistré par</h3>
                      </div>
                      <div className="flex items-center gap-3 pl-7">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {depense.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{depense.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {depense.user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Métadonnées
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Créé le
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(depense.created_at)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Dernière modification
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(depense.updated_at)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          ID
                        </div>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {depense.id}
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
                      <Link href={`/depenses/${depense.id}/edit`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier cette dépense
                        </Button>
                      </Link>

                      {depense.budget && (
                        <Link href={`/budgets/${depense.budget.id}`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <Wallet className="h-4 w-4 mr-2" />
                            Voir le budget
                          </Button>
                        </Link>
                      )}

                      <Link href="/depenses" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Retour à la liste
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approbations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Historique des approbations
                  </CardTitle>
                  <CardDescription>
                    Suivi des décisions sur cette dépense
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {depense.approbations && depense.approbations.length > 0 ? (
                    <div className="space-y-4">
                      {depense.approbations
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((approbation) => (
                          <div key={approbation.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold">
                                  {approbation.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{approbation.user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(approbation.created_at)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getDecisionBadge(approbation.decision)}
                              </div>
                              {approbation.commentaire && (
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                  <p>{approbation.commentaire}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Aucune approbation enregistrée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div style={{ display: 'none' }}>
          <PrintDepense ref={printRef} depense={depense} />
        </div>


      </DashboardLayout>
    </>
  );
}