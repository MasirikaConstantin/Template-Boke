import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  CreditCard, 
  User,
  FileText,
  Receipt,
  History,
  Printer,
  Download,
  Hash,
  Clock,
  UserCircle
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { useReactToPrint } from 'react-to-print';
import PrintPaiementFrais from './PrintPaiementFrais';

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
    id: number;
    nom_frais: string;
    annee_scolaire: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface HistoriquePaiement {
  id: number;
  action: string;
  details: string | null;
  created_at: string;
  user: User;
}

interface Paiement {
  id: number;
  eleve_id: number | null;
  tranche_id: number | null;
  user_id: number;
  reference: string;
  montant: number;
  mode_paiement: 'espèce' | 'chèque' | 'virement' | 'mobile_money';
  numero_cheque: string | null;
  commentaire: string | null;
  date_paiement: string;
  created_at: string;
  updated_at: string;
  eleve?: Eleve;
  tranche?: Tranche;
  user: User;
  historique_paiements?: HistoriquePaiement[];
}

interface PaiementShowProps {
  auth: any;
  paiement: Paiement;
}

export default function PaiementShow({ auth, paiement }: PaiementShowProps) {
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

  const getModePaiementBadge = (mode: string) => {
    const colors = {
      'espèce': 'bg-green-100 text-green-800 border-green-200',
      'chèque': 'bg-blue-100 text-blue-800 border-blue-200',
      'virement': 'bg-purple-100 text-purple-800 border-purple-200',
      'mobile_money': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <Badge variant="outline" className={`${colors[mode]} border`}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </Badge>
    );
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
      contentRef: printRef,   // nouvelle API
      documentTitle: `Quittance_${paiement.reference}_${paiement.eleve.nom_complet}`,

  });
  
  return (
    <>
      <Head title={`Détails: ${paiement.reference}`} />
      
      <DashboardLayout activeRoute="/paiements">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Paiement {paiement.reference}</h1>
              <p className="text-muted-foreground">
                {formatMontant(paiement.montant)} • {formatDate(paiement.date_paiement)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              
              <Link href="/paiements">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/paiements/${paiement.id}/edit`}>
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
                <Receipt className="h-4 w-4" />
                Détails
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
                {paiement.historique_paiements && (
                  <Badge variant="outline" className="ml-1">
                    {paiement.historique_paiements.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
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
                          {paiement.reference}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Montant
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatMontant(paiement.montant)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Mode de paiement
                        </div>
                        <div className="flex items-center gap-2">
                          {getModePaiementBadge(paiement.mode_paiement)}
                          {paiement.numero_cheque && (
                            <span className="text-sm text-muted-foreground">
                              • N° {paiement.numero_cheque}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Date de paiement
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(paiement.date_paiement)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paiement.eleve && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Élève</h3>
                          </div>
                          <div className="space-y-2 pl-7">
                            <div>
                              <div className="font-medium">
                                {paiement.eleve.nom} {paiement.eleve.prenom}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Réf: {paiement.eleve.ref}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {paiement.tranche && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Tranche</h3>
                          </div>
                          <div className="space-y-2 pl-7">
                            <div>
                              <div className="font-medium">{paiement.tranche.nom_tranche}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Ordre: #{paiement.tranche.ordre}</div>
                                <div>
                                  Limite: {new Date(paiement.tranche.date_limite).toLocaleDateString('fr-FR')}
                                </div>
                                {paiement.tranche.configuration_frais && (
                                  <div>
                                    Configuration: {paiement.tranche.configuration_frais.nom_frais}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {paiement.commentaire && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Commentaire
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="whitespace-pre-wrap">{paiement.commentaire}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Enregistré par</h3>
                      </div>
                      <div className="flex items-center gap-3 pl-7">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {paiement.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{paiement.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {paiement.user.email}
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
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(paiement.created_at)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Dernière modification
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(paiement.updated_at)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          ID
                        </div>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {paiement.id}
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
                      <Link href={`/paiements/${paiement.id}/edit`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier ce paiement
                        </Button>
                      </Link>
                      
                      {paiement.eleve && (
                        <Link href={`/eleves/${paiement.eleve.id}`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Voir l'élève
                          </Button>
                        </Link>
                      )}

                      {paiement.tranche && (
                        <Link href={`/tranches/${paiement.tranche.id}`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Voir la tranche
                          </Button>
                        </Link>
                      )}

                      <Link href="/paiements" className="block">
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

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des modifications
                  </CardTitle>
                  <CardDescription>
                    Suivi complet des actions sur ce paiement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paiement.historique_paiements && paiement.historique_paiements.length > 0 ? (
                    <div className="space-y-4">
                      {paiement.historique_paiements
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((historique) => {
                          const details = parseDetails(historique.details);
                          return (
                            <div key={historique.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold">
                                    {historique.user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{historique.user.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(historique.created_at)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    historique.action === 'création' ? 'default' :
                                    historique.action === 'modification' ? 'secondary' :
                                    'destructive'
                                  }>
                                    {historique.action.charAt(0).toUpperCase() + historique.action.slice(1)}
                                  </Badge>
                                </div>
                                {details && (
                                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                    {typeof details === 'string' ? (
                                      <p>{details}</p>
                                    ) : (
                                      <pre className="whitespace-pre-wrap text-xs">
                                        {JSON.stringify(details, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Aucun historique disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

           <div style={{ display: 'none' }}>
          <PrintPaiementFrais ref={printRef} paiement={paiement} />
        </div>
        </div>
      </DashboardLayout>
    </>
  );
}