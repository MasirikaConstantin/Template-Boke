import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  Download,
  Printer,
  Mail,
  Bell,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  School,
  DollarSign,
  Percent,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    montant_total: number;
  };
}

interface Classe {
  id: number;
  nom_classe: string;
  nom_complet: string;
}

interface Dette {
  id: number;
  nom: string;
  prenom: string;
  ref: string;
  classe: {
    id: number;
    nom: string;
    complet: string;
  } | null;
  tranche_id: number;
  tranche_nom: string;
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  pourcentage_paye: number;
  est_regle: boolean;
  date_limite: string;
  jours_restants: number;
  date_dernier_paiement: string | null;
  statut: {
    code: 'regle' | 'retard' | 'urgent' | 'en_cours';
    label: string;
    color: string;
    variant: 'default' | 'destructive' | 'warning' | 'secondary';
  };
}

interface RecouvrementPageProps {
  autre: any;
  auth: any;
  tranches: Tranche[];
  classes: Classe[];
  dettes: Dette[];
  stats: {
    total_eleves: number;
    total_dette: number;
    total_paye: number;
    taux_recouvrement: number;
    total_reste: number;
    nombre_regles: number;
    nombre_en_retard: number;
  };
  filters: {
    tranche_id: string;
    classe_id: string;
    statut: string;
  };
  selectedTranche: Tranche | null;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function RecouvrementIndex({
  auth,
  tranches,
  classes,
  dettes,
  stats,
  filters,
  selectedTranche,
  flash,
}: RecouvrementPageProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [showRappelModal, setShowRappelModal] = useState(false);
  const [donnesApi, setdonnesApi] = useState<Dette[]>([]);
  const handleFilterChange = (key: string, value: string) => {
    router.get('/recouvrement', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(dettes.map(dette => dette.id));
    } else {
      setSelectedIds([]);
    }
  };
  const [processing, setProcessing] = useState(false);

  const handleSelectDette = (id: number, checked: boolean) => {
    const dette = dettes.find(d => d.id === id);
    if (!dette) return;
    if (checked) {
      setSelectedIds([...selectedIds, id]);
      setdonnesApi(prev => [...prev, dette]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      setdonnesApi(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleGenererRapport = (format: 'pdf' | 'excel', selectionOnly = false) => {
    if (!filters.tranche_id) {
      alert('Veuillez sélectionner une tranche d\'abord.');
      return;
    }

    if (selectionOnly && selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins un élève.');
      return;
    }

    const params = new URLSearchParams({
      tranche_id: filters.tranche_id,
      format,
    });

    if (filters.classe_id !== 'all') {
      params.append('classe_id', filters.classe_id);
    }

    if (filters.statut !== 'tous') {
      params.append('statut', filters.statut);
    }

    if (selectionOnly) {
      params.append('selection', JSON.stringify(selectedIds));
    }

    // Ouvre dans un nouvel onglet !
    window.open(`/recouvrement/generer-rapport?${params.toString()}`, '_blank');
  };


  const handleEnvoyerRappels = () => {
    if (selectedIds.length === 0 || processing) return;

    setProcessing(true);

    router.post('/recouvrement/envoyer-rappels', {
      tranche_id: filters.tranche_id,
      eleve_ids: selectedIds,
      dettes: (donnesApi), // recommandé
    }, {
      onSuccess: () => {
        setProcessing(false);
        setSelectedIds([]);
        setShowRappelModal(false);
      },
      onError: (e) => {
        setProcessing(false);
        setShowRappelModal(false);
        console.error(e);
      },
      onFinish: () => {
        // sécurité si onError/onSuccess ne passe pas
        setProcessing(false);
      },
    });
  };


  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(montant).replace('$US', '$');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutBadge = (statut: Dette['statut']) => {
    return (
      <Badge variant={statut.variant}>
        {statut.code === 'regle' && <CheckCircle className="h-3 w-3 mr-1" />}
        {statut.code === 'retard' && <AlertCircle className="h-3 w-3 mr-1" />}
        {statut.code === 'urgent' && <Clock className="h-3 w-3 mr-1" />}
        {statut.code === 'en_cours' && <Clock className="h-3 w-3 mr-1" />}
        {statut.label}
      </Badge>
    );
  };

  const getDettesFiltrees = () => {
    if (!search) return dettes;

    const searchLower = search.toLowerCase();
    return dettes.filter(dette =>
      dette.nom.toLowerCase().includes(searchLower) ||
      dette.prenom.toLowerCase().includes(searchLower) ||
      dette.ref.toLowerCase().includes(searchLower) ||
      (dette.classe?.nom.toLowerCase().includes(searchLower))
    );
  };

  const dettesFiltrees = getDettesFiltrees();

  return (
    <>
      <Head title="Recouvrement des paiements" />

      <DashboardLayout activeRoute="/recouvrement">
        <PageHeader
          title="Recouvrement"
          description="Suivi des paiements et gestion des dettes"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Recouvrement', href: '/recouvrement' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleGenererRapport('pdf', true)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Exporter PDF (Sélection)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenererRapport('excel', true)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Exporter Excel (Sélection)
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => handleGenererRapport('pdf', false)}
                disabled={!filters.tranche_id}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF (Tous)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenererRapport('excel', false)}
                disabled={!filters.tranche_id}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter Excel (Tous)
              </Button>
            </div>
          }
        />

        {flash?.success && (
          <Alert className="mb-6">
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tranche</label>
                <Select
                  value={filters.tranche_id || ''}
                  onValueChange={(value) => handleFilterChange('tranche_id', value)}
                >
                  <SelectTrigger>
                    <CreditCard className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sélectionnez une tranche" />
                  </SelectTrigger>
                  <SelectContent>
                    {tranches.map((tranche) => (
                      <SelectItem key={tranche.id} value={tranche.id.toString()}>
                        {tranche.nom_tranche} - {formatMontant(tranche.montant)}
                        {tranche.configuration_frais &&
                          ` (${tranche.configuration_frais.nom_frais})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Classe</label>
                  <Select
                    value={filters.classe_id || ''}
                    onValueChange={(value) => handleFilterChange('classe_id', value)}
                    disabled={!filters.tranche_id}
                  >
                    <SelectTrigger>
                      <School className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Toutes classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes classes</SelectItem>
                      {classes.map((classe) => (
                        <SelectItem key={classe.id} value={classe.id.toString()}>
                          {classe.nom_classe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={filters.statut || 'tous'}
                    onValueChange={(value) => handleFilterChange('statut', value)}
                    disabled={!filters.tranche_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous statuts</SelectItem>
                      <SelectItem value="regle">Réglé</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="retard">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {selectedTranche && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedTranche.nom_tranche}</h3>
                    <div className="text-sm text-muted-foreground">
                      {selectedTranche.configuration_frais?.nom_frais} •
                      Limite: {formatDate(selectedTranche.date_limite)} •
                      {selectedTranche.jours_restants > 0
                        ? ` ${Math.ceil(selectedTranche.jours_restants)} jours restants`
                        : ' Échue'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatMontant(selectedTranche.montant)}</div>
                    <div className="text-sm text-muted-foreground">Montant par élève</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        {filters.tranche_id && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Élèves concernés</p>
                      <p className="text-2xl font-bold">{stats.total_eleves}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Montant total dû</p>
                      <p className="text-2xl font-bold">{formatMontant(stats.total_dette)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de recouvrement</p>
                      <p className="text-2xl font-bold">{stats.taux_recouvrement.toFixed(1)}%</p>
                    </div>
                    <Percent className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En retard</p>
                      <p className="text-2xl font-bold">{stats.nombre_en_retard}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progression du recouvrement</CardTitle>
                  <CardDescription>
                    {formatMontant(stats.total_paye)} / {formatMontant(stats.total_dette)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={stats.taux_recouvrement} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Payé</div>
                        <div className="font-semibold">{formatMontant(stats.total_paye)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Restant</div>
                        <div className="font-semibold">{formatMontant(stats.total_reste)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Réglés</div>
                        <div className="font-semibold">
                          {stats.nombre_regles} / {stats.total_eleves} élèves
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Liste des dettes */}
        {filters.tranche_id ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Liste des élèves</CardTitle>
                  <CardDescription>
                    {dettesFiltrees.length} élève(s) trouvé(s)
                    {search && ` pour "${search}"`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="">
                    <Button
                      variant="outline"
                      disabled={selectedIds.length === 0}
                      onClick={() => setShowRappelModal(true)}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Envoyer des rappels ({selectedIds.length})
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un élève..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.length === dettesFiltrees.length && dettesFiltrees.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Élève</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Montant dû</TableHead>
                      <TableHead>Payé</TableHead>
                      <TableHead>Reste</TableHead>
                      <TableHead>Progression</TableHead>
                      <TableHead>Dernier paiement</TableHead>
                      <TableHead>Jours restants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dettesFiltrees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p className="text-lg">Aucun élève trouvé</p>
                          <p className="text-sm mt-2">
                            {search ? 'Essayez avec d\'autres termes de recherche' : 'Ajustez les filtres pour voir les résultats'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      dettesFiltrees.map((dette) => (

                        <TableRow key={dette.id} className="hover:bg-muted/50">

                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(dette.id)}
                              onCheckedChange={(checked) => handleSelectDette(dette.id, checked === true)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {dette.nom} {dette.prenom}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Réf: {dette.ref}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {dette.classe ? (
                              <div>
                                <div className="font-medium">{dette.classe.nom}</div>
                                <div className="text-xs text-muted-foreground">
                                  {dette.classe.nom_classe}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Non assigné</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatutBadge(dette.statut)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatMontant(dette.montant_total)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatMontant(dette.montant_paye)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dette.pourcentage_paye.toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-semibold ${dette.reste_a_payer > 0 ? 'text-destructive' : 'text-green-600'
                              }`}>
                              {formatMontant(dette.reste_a_payer)}
                            </div>
                          </TableCell>
                          <TableCell className="w-48">
                            <div className="space-y-2">
                              <Progress value={dette.pourcentage_paye} className="h-2" />
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {dette.pourcentage_paye.toFixed(1)}%
                                </span>
                                <span className={
                                  dette.pourcentage_paye >= 100 ? 'text-green-600' :
                                    dette.pourcentage_paye >= 50 ? 'text-amber-600' :
                                      'text-destructive'
                                }>
                                  {dette.pourcentage_paye >= 100 ? 'Complet' :
                                    dette.pourcentage_paye >= 50 ? 'Partiel' :
                                      'À payer'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {dette.date_dernier_paiement ? (
                              <div className="text-sm">
                                {formatDate(dette.date_dernier_paiement)}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Aucun</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`text-sm font-medium ${dette.jours_restants < 0 ? 'text-destructive' :
                              dette.jours_restants <= 7 ? 'text-amber-600' :
                                'text-green-600'
                              }`}>
                              {dette.jours_restants < 0
                                ? `${Math.abs(dette.jours_restants)}j de retard`
                                : `${Math.ceil(dette.jours_restants)}j restants`
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une tranche</h3>
                <p className="text-muted-foreground mb-6">
                  Veuillez sélectionner une tranche pour voir la liste des dettes
                </p>
                <div className="flex justify-center gap-2">
                  {tranches.slice(0, 3).map((tranche) => (
                    <Button
                      key={tranche.id}
                      variant="outline"
                      onClick={() => handleFilterChange('tranche_id', tranche.id.toString())}
                    >
                      {tranche.nom_tranche}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal d'envoi de rappels */}
        {showRappelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Envoyer des rappels</h3>
              <p className="text-muted-foreground mb-6">
                Vous allez envoyer des rappels de paiement à {selectedIds.length} élève(s).
              </p>
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRappelModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleEnvoyerRappels}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Envoyer les rappels
                      </>
                    )}
                  </Button>

                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}