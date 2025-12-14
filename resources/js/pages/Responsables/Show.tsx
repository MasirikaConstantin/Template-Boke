import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  MapPin,
  Users,
  Award,
  BookOpen,
  History,
  TrendingUp,
  Edit,
  ArrowLeft,
  Download,
  Shield,
  Briefcase,
  Stethoscope,
  Eye,
  CreditCard,
  BanknoteIcon,
  FileText,
  GraduationCap,
  Building,
  DollarSign,
  Receipt,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import responsables from '@/routes/responsables';

interface Paiement {
  id: number;
  reference: string;
  montant: string;
  mode_paiement: string;
  date_paiement: string;
  commentaire: string | null;
  tranche?: {
    id: number;
    nom_tranche: string;
    configuration_frais?: {
      nom_frais: string;
    };
  };
  user?: {
    name: string;
  };
}

interface InformationFinanciere {
  eleve_id: number;
  eleve_nom: string;
  eleve_matricule: string;
  montant_total_paye: number;
  nombre_paiements: number;
  derniers_paiements: Paiement[];
}

interface ShowResponsableProps {
  responsable: {
    id: number;
    nom: string;
    prenom: string;
    nom_complet: string;
    type_responsable: string;
    cin: string | null;
    date_naissance: string | null;
    lieu_naissance: string | null;
    sexe: 'M' | 'F';
    profession: string | null;
    entreprise: string | null;
    poste: string | null;
    revenu_mensuel: number | null;
    adresse: string | null;
    ville: string | null;
    pays: string;
    telephone_1: string;
    telephone_2: string | null;
    email: string | null;
    situation_matrimoniale: string | null;
    niveau_etude: string | null;
    observations: string | null;
    ref: string;
    created_at: string;
    updated_at: string;
    created_by: {
      id: number;
      name: string;
      email: string;
    } | null;
    updated_by: {
      id: number;
      name: string;
      email: string;
    } | null;

    eleves: Array<{
      id: number;
      matricule: string;
      nom: string;
      prenom: string;
      nom_complet: string;
      classe: {
        id: number;
        nom_classe: string;
        niveau: string;
      } | null;
      pivot: {
        lien: string;
        lier_parental: string;
        est_responsable_financier: boolean;
        est_contact_urgence: boolean;
        est_autorise_retirer: boolean;
        ordre_priorite: number;
        telephone_urgence: string | null;
      };
      autres_responsables?: Array<{
        id: number;
        nom_complet: string;
      }>;
      paiements?: Paiement[];
    }>;
  };
  informationsFinancieres: InformationFinanciere[];
  statistiques: {
    total_paye: number;
    nombre_eleves_financiers: number;
    nombre_paiements_total: number;
  };
}

export default function ShowResponsable({
  responsable,
  informationsFinancieres,
  statistiques
}: ShowResponsableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' $';
  };

  const getTypeResponsableLabel = (type: string) => {
    switch (type) {
      case 'pere': return 'Père';
      case 'mere': return 'Mère';
      case 'tuteur': return 'Tuteur';
      default: return 'Autre';
    }
  };

  const getSituationLabel = (situation: string | null) => {
    if (!situation) return 'Non renseigné';
    const labels: Record<string, string> = {
      'marie': 'Marié(e)',
      'celibataire': 'Célibataire',
      'divorce': 'Divorcé(e)',
      'veuf': 'Veuf(ve)',
    };
    return labels[situation] || situation;
  };

  const getNiveauEtudeLabel = (niveau: string | null) => {
    if (!niveau) return 'Non renseigné';
    const labels: Record<string, string> = {
      'primaire': 'Primaire',
      'secondaire': 'Secondaire',
      'universitaire': 'Universitaire',
      'aucun': 'Aucun',
    };
    return labels[niveau] || niveau;
  };

  const getLienLabel = (lien: string) => {
    const labels: Record<string, string> = {
      'pere': 'Père',
      'mere': 'Mère',
      'tuteur_legal': 'Tuteur légal',
      'grand_parent': 'Grand-parent',
      'oncle_tante': 'Oncle/Tante',
      'frere_soeur': 'Frère/Sœur',
      'autre': 'Autre',
    };
    return labels[lien] || lien;
  };

  const getModePaiementIcon = (mode: string) => {
    switch (mode) {
      case 'espèce': return '💵';
      case 'chèque': return '🏦';
      case 'virement': return '💳';
      case 'mobile_money': return '📱';
      default: return '💰';
    }
  };
  console.log(responsable.eleves);
  return (
    <>
      <Head title={responsable.nom_complet} />

      <DashboardLayout activeRoute="/responsables">
        <PageHeader
          title={responsable.nom_complet}
          description={`${getTypeResponsableLabel(responsable.type_responsable)} • ${responsable.eleves.length} élève(s)`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Responsables', href: '/responsables' },
            { label: responsable.nom_complet, href: `/responsables/${responsable.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href={responsables.relever(responsable.id)}>
                <Button variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Relever
                </Button>
              </Link>
              <Link href={`/responsables/${responsable.id}/eleves`}>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer élèves
                </Button>
              </Link>
              <Link href={`/responsables/${responsable.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Profil */}
          <div className="space-y-6">
            {/* Carte profil */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`h-32 w-32 rounded-full flex items-center justify-center text-5xl ${responsable.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                    {responsable.type_responsable === 'pere' ? '👨' :
                      responsable.type_responsable === 'mere' ? '👩' : '👤'}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">{responsable.nom_complet}</h2>
                    <p className="text-muted-foreground">Réf: {responsable.ref}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="default">
                      {getTypeResponsableLabel(responsable.type_responsable)}
                    </Badge>
                    <Badge variant={responsable.sexe === 'M' ? 'default' : 'secondary'}>
                      {responsable.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{responsable.telephone_1}</span>
                  </div>

                  {responsable.telephone_2 && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{responsable.telephone_2}</span>
                    </div>
                  )}

                  {responsable.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{responsable.email}</span>
                    </div>
                  )}

                  {responsable.date_naissance && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Né(e) le {formatDate(responsable.date_naissance)}</span>
                    </div>
                  )}

                  {responsable.lieu_naissance && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>À {responsable.lieu_naissance}</span>
                    </div>
                  )}

                  {responsable.cin && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>CIN: {responsable.cin}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profession */}
            {responsable.profession && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Profession
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Profession</p>
                      <p className="font-medium">{responsable.profession}</p>
                    </div>

                    {responsable.entreprise && (
                      <div>
                        <p className="text-sm text-muted-foreground">Entreprise</p>
                        <p className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {responsable.entreprise}
                        </p>
                      </div>
                    )}

                    {responsable.poste && (
                      <div>
                        <p className="text-sm text-muted-foreground">Poste</p>
                        <p className="font-medium">{responsable.poste}</p>
                      </div>
                    )}

                    {responsable.revenu_mensuel && (
                      <div>
                        <p className="text-sm text-muted-foreground">Revenu mensuel</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatMontant(responsable.revenu_mensuel)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adresse */}
            {responsable.adresse && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{responsable.adresse}</p>

                    {responsable.ville && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{responsable.ville}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>{responsable.pays}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistiques financières */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BanknoteIcon className="h-4 w-4" />
                  Aperçu financier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total payé</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatMontant(statistiques.total_paye)}
                      </p>
                    </div>
                    <BanknoteIcon className="h-8 w-8 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Élèves financiers</p>
                      <p className="text-2xl font-bold">{statistiques.nombre_eleves_financiers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Paiements effectués</p>
                      <p className="text-2xl font-bold">{statistiques.nombre_paiements_total}</p>
                    </div>
                    <Receipt className="h-8 w-8 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne centrale et droite - Onglets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="eleves" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="eleves" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Élèves ({responsable.eleves.length})
                </TabsTrigger>
                <TabsTrigger value="paiements" className="flex items-center gap-2">
                  <BanknoteIcon className="h-4 w-4" />
                  Paiements
                </TabsTrigger>
                <TabsTrigger value="informations" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations
                </TabsTrigger>
              </TabsList>

              {/* Onglet Élèves */}
              <TabsContent value="eleves" className="space-y-6 pt-6">
                <div className="space-y-4">
                  {responsable.eleves.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">Aucun élève associé</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Associez des élèves dans la page de gestion
                      </p>
                      <Link href={`/responsables/${responsable.id}/eleves`}>
                        <Button variant="outline" className="mt-4">
                          <Users className="h-4 w-4 mr-2" />
                          Gérer les élèves
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {responsable.eleves.map((eleve) => (
                        <Card key={eleve.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{eleve.nom_complet}</p>
                                  {eleve.pivot.est_responsable_financier == true && (
                                    <Badge variant="default" className="text-xs">
                                      <BanknoteIcon className="h-3 w-3 mr-1" />
                                      Financier
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                                    <span>{eleve.matricule}</span>
                                  </div>

                                  {eleve.classe && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                      <span>{eleve.classe.nom_classe}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span>{getLienLabel(eleve.pivot.lien_parental)}</span>
                                    {eleve.pivot.ordre_priorite > 1 && (
                                      <Badge variant="outline" className="text-xs">
                                        #{eleve.pivot.ordre_priorite}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Total payé par cet élève */}
                                  {eleve.paiements && eleve.paiements.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <DollarSign className="h-3 w-3 text-green-500" />
                                      <span className="font-medium text-green-600">
                                        {formatMontant(
                                          eleve.paiements.reduce((sum, p) => {
                                            const montant = parseFloat(p.montant ?? 0)
                                            return sum + (isNaN(montant) ? 0 : montant)
                                          }, 0)
                                        )} payés
                                        payés
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {eleve.paiements.length} paiement(s)
                                      </Badge>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                  {eleve.pivot.est_contact_urgence == true && (
                                    <Badge variant="secondary" className="text-xs">
                                      Contact urgence
                                    </Badge>
                                  )}
                                  {eleve.pivot.est_autorise_retirer == true && (
                                    <Badge variant="outline" className="text-xs">
                                      Peut retirer
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <Link href={`/eleves/${eleve.id}`}>
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/eleves/${eleve.id}/paiements`}>
                                  <Button size="sm" variant="ghost">
                                    <BanknoteIcon className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>

                            {/* Autres responsables */}
                            {eleve.autres_responsables && eleve.autres_responsables.length > 0 && (
                              <div className="pt-3 mt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-1">Autres responsables</p>
                                <div className="flex flex-wrap gap-1">
                                  {eleve.autres_responsables.map((autre) => (
                                    <Badge key={autre.id} variant="outline" className="text-xs">
                                      {autre.nom_complet}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Onglet Paiements */}
              <TabsContent value="paiements" className="space-y-6 pt-6">
                {informationsFinancieres.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <BanknoteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">Aucun paiement enregistré</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ce responsable n'est pas désigné comme responsable financier
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Liste des élèves financiers avec leurs paiements */}
                    {informationsFinancieres.map((info) => (
                      <Card key={info.eleve_id}>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{info.eleve_nom}</span>
                              <Badge variant="outline">{info.eleve_matricule}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-bold">
                                {formatMontant(info.montant_total_paye)}
                              </span>
                              <Badge variant="default">{info.nombre_paiements} paiement(s)</Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {info.derniers_paiements.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              Aucun paiement enregistré pour cet élève
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {info.derniers_paiements.map((paiement) => (
                                <div key={paiement.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${paiement.mode_paiement === 'espèce' ? 'bg-green-100 text-green-800' :
                                        paiement.mode_paiement === 'chèque' ? 'bg-blue-100 text-blue-800' :
                                          paiement.mode_paiement === 'virement' ? 'bg-purple-100 text-purple-800' :
                                            'bg-amber-100 text-amber-800'
                                      }`}>
                                      <span className="text-lg">
                                        {getModePaiementIcon(paiement.mode_paiement)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium">{paiement.reference}</p>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(paiement.date_paiement)}
                                        {paiement.tranche?.configuration_frais && (
                                          <>
                                            <span>•</span>
                                            <span>{paiement.tranche.configuration_frais.nom_frais}</span>
                                          </>
                                        )}
                                      </div>
                                      {paiement.commentaire && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {paiement.commentaire}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-xl font-bold text-green-600">
                                      {formatMontant(paiement.montant)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {paiement.mode_paiement}
                                      </Badge>
                                      {paiement.tranche && (
                                        <Badge variant="secondary" className="text-xs">
                                          {paiement.tranche.nom_tranche}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {info.nombre_paiements > info.derniers_paiements.length && (
                                <div className="text-center pt-3 border-t">
                                  <Link href={`/eleves/${info.eleve_id}/paiements`}>
                                    <Button variant="ghost" size="sm">
                                      Voir les {info.nombre_paiements} paiements
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Onglet Informations */}
              <TabsContent value="informations" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Situation personnelle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Situation matrimoniale</p>
                        <p className="font-medium">{getSituationLabel(responsable.situation_matrimoniale)}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Niveau d'étude</p>
                        <p className="font-medium">{getNiveauEtudeLabel(responsable.niveau_etude)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observations */}
                  {responsable.observations && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Observations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{responsable.observations}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Informations système */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Informations système</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Référence</p>
                        <p className="font-mono text-sm">{responsable.ref}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Créé le</p>
                          <p className="text-sm">{formatDateTime(responsable.created_at)}</p>
                          {responsable.created_by && (
                            <p className="text-xs text-muted-foreground">
                              Par {responsable.created_by.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Dernière modification</p>
                          <p className="text-sm">{formatDateTime(responsable.updated_at)}</p>
                          {responsable.updated_by && (
                            <p className="text-xs text-muted-foreground">
                              Par {responsable.updated_by.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}