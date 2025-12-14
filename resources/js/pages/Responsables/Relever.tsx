import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Printer,
  Eye,
  BarChart3,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Paiement {
  id: number;
  montant: number;
  date_paiement: string;
  mode_paiement: string;
  reference: string;
  eleve: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    classe: {
      nom_classe: string;
    };
  };
  tranche: {
    id: number;
    nom_tranche: string;
    montant: number;
    annee_scolaire: string;
  };
  user: {
    name: string;
  };
}

interface EleveStat {
  id: number;
  nom_complet: string;
  matricule: string;
  classe: string;
  total_paye: number;
}

interface ResponsableReleverPageProps {
  responsable: {
    id: number;
    nom_complet: string;
    telephone_1: string;
    email: string | null;
    adresse: string | null;
  };
  paiements: {
    data: Paiement[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  eleves: Array<{
    id: number;
    matricule: string;
    nom_complet: string;
    classe: {
      nom_classe: string;
    };
  }>;
  tranches: Array<{
    id: number;
    nom_tranche: string;
    montant: number;
    annee_scolaire: string;
  }>;
  annees: string[];
  filters: {
    eleve_id?: string;
    tranche_id?: string;
    annee_scolaire?: string;
    date_debut?: string;
    date_fin?: string;
  };
  stats: {
    total_eleves: number;
    total_paiements: number;
    total_montant: number;
    stats_par_eleve: EleveStat[];
  };
}

export default function ResponsableRelever({
  responsable,
  paiements,
  eleves,
  tranches,
  annees,
  filters,
  stats,
}: ResponsableReleverPageProps) {
  const [localFilters, setLocalFilters] = useState({
    eleve_id: filters.eleve_id || 'all',
    tranche_id: filters.tranche_id || 'all',
    annee_scolaire: filters.annee_scolaire || 'all',
    date_debut: filters.date_debut || '',
    date_fin: filters.date_fin || '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Envoyer les filtres au serveur
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v && v !== 'all')
    );

    router.get(`/responsables/${responsable.id}/relever`, cleanFilters, {
      preserveState: true,
    });
  };

  const handleExportPdf = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(localFilters).filter(([_, v]) => v && v !== 'all')
    );

    const query = new URLSearchParams({
      ...cleanFilters,
      export: 'pdf',
    }).toString();

    window.open(
      `/responsables/${responsable.id}/relever?${query}`,
      '_blank'
    );
  };


  const handleResetFilters = () => {
    setLocalFilters({
      eleve_id: 'all',
      tranche_id: 'all',
      annee_scolaire: 'all',
      date_debut: '',
      date_fin: '',
    });

    router.get(`/responsables/${responsable.id}/relever`, {}, {
      preserveState: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const getModePaiementBadge = (mode: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'especes': 'default',
      'cheque': 'secondary',
      'virement': 'outline',
      'mobile_money': 'default',
    };

    const labels: Record<string, string> = {
      'especes': 'Espèces',
      'cheque': 'Chèque',
      'virement': 'Virement',
      'mobile_money': 'Mobile Money',
    };

    return (
      <Badge variant={variants[mode] || 'outline'}>
        {labels[mode] || mode}
      </Badge>
    );
  };
  return (
    <>
      <Head title={`Relevé de paiements - ${responsable.nom_complet}`} />

      <DashboardLayout activeRoute="/responsables">
        <PageHeader
          title={`Relevé de paiements`}
          description={`Responsable: ${responsable.nom_complet}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Responsables', href: '/responsables' },
            { label: responsable.nom_complet, href: `/responsables/${responsable.id}` },
            { label: 'Relevé', href: `/responsables/${responsable.id}/relever` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href={`/responsables/${responsable.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Button onClick={handleExportPdf} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
              <Button onClick={handleExportPdf}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          }
        />

        {/* Informations du responsable */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{responsable.nom_complet}</h3>
                {responsable.telephone_1 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    📱 {responsable.telephone_1}
                  </p>
                )}
                {responsable.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    ✉️ {responsable.email}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Statistiques</h4>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Élèves:</span>{' '}
                    <span className="font-semibold">{stats.total_eleves}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total payé:</span>{' '}
                    <span className="font-semibold text-green-600">
                      {formatMontant(stats.total_montant)}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Période du relevé</h4>
                <p className="text-sm">
                  {filters.date_debut || 'Début'} - {filters.date_fin || 'Fin'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paiements.total} paiement(s) trouvé(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className=" gap-6">
          {/* Colonne gauche - Filtres et statistiques */}
          <div className="space-y-6 mb-4">
            {/* Filtres */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 ">
                <div className='flex gap-2'>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Élève</label>
                    <Select
                      value={localFilters.eleve_id}
                      onValueChange={(value) => handleFilterChange('eleve_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les élèves" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les élèves</SelectItem>
                        {eleves.map((eleve) => (
                          <SelectItem key={eleve.id} value={eleve.id.toString()}>
                            {eleve.nom_complet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tranche</label>
                    <Select
                      value={localFilters.tranche_id}
                      onValueChange={(value) => handleFilterChange('tranche_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les tranches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les tranches</SelectItem>
                        {tranches.map((tranche) => (
                          <SelectItem key={tranche.id} value={tranche.id.toString()}>
                            {tranche.nom_tranche} ({tranche.annee_scolaire})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Année scolaire</label>
                    <Select
                      value={localFilters.annee_scolaire}
                      onValueChange={(value) => handleFilterChange('annee_scolaire', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les années" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les années</SelectItem>
                        {annees.map((annee) => (
                          <SelectItem key={annee} value={annee}>
                            {annee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date de début</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={localFilters.date_debut}
                        onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date de fin</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={localFilters.date_fin}
                        onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleResetFilters}
                    variant="outline"
                    className="w-full"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Colonne droite - Liste des paiements */}
          <div className="lg:col-span-3 ">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Historique des paiements ({paiements.total})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Total: <span className="font-semibold text-green-600">
                        {formatMontant(stats.total_montant)}
                      </span>
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {paiements.data.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Aucun paiement trouvé</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajustez les filtres ou vérifiez les données
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Élève</TableHead>
                            <TableHead>Tranche</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Mode</TableHead>
                            <TableHead>Référence</TableHead>
                            <TableHead>Enregistré par</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paiements.data.map((paiement) => (
                            <TableRow key={paiement.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(paiement.date_paiement)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{paiement.eleve.nom_complet}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {paiement.eleve.matricule} • {paiement.eleve.classe.nom_classe}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {paiement.tranche?.nom_tranche ?? '—'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {paiement.tranche?.annee_scolaire ?? 'Non définie'}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell className="font-semibold text-green-600">
                                {formatMontant(paiement.montant)}
                              </TableCell>
                              <TableCell>
                                {getModePaiementBadge(paiement.mode_paiement)}
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {paiement.reference}
                                </code>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {paiement.user?.name}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Récapitulatif */}
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                      <h4 className="text-sm font-medium mb-3">Récapitulatif</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border rounded">
                          <p className="text-2xl font-bold">{paiements.total}</p>
                          <p className="text-xs text-muted-foreground">Transactions</p>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <p className="text-2xl font-bold text-green-600">
                            {formatMontant(stats.total_montant)}
                          </p>
                          <p className="text-xs text-muted-foreground">Montant total</p>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <p className="text-2xl font-bold">{stats.total_eleves}</p>
                          <p className="text-xs text-muted-foreground">Élèves concernés</p>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <p className="text-2xl font-bold">
                            {paiements.data.length > 0
                              ? formatMontant(stats.total_montant / paiements.total)
                              : '$0.00'}
                          </p>
                          <p className="text-xs text-muted-foreground">Moyenne par paiement</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>



            {/* Statistiques par élève */}
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Par élève
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.stats_par_eleve.map((eleveStat) => (
                    <div key={eleveStat.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Link href={`/responsables/${responsable.id}/relever?eleve_id=${eleveStat.id}`}>
                          <Button variant="ghost" size="sm" className="h-auto p-0">
                            <p className="text-sm font-medium text-left hover:underline">
                              {eleveStat.nom_complet}
                            </p>
                          </Button>
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {eleveStat.matricule}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {eleveStat.classe}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatMontant(eleveStat.total_paye)}
                        </p>
                      </div>

                      <div className="mt-2">
                        <Link href={`/responsables/${responsable.id}/relever/eleve/${eleveStat.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-3 w-3 mr-1" />
                            Voir le détail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}