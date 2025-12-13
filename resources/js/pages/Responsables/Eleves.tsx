    import React, { useState } from 'react';
    import { Head, Link, router, useForm } from '@inertiajs/react';
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
    import { Alert, AlertDescription } from '@/components/ui/alert';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import {
    Users,
    UserPlus,
    UserMinus,
    Eye,
    Search,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Link as LinkIcon,
    Unlink,
    GraduationCap,
    Phone,
    Mail,
    Shield,
    Home,
    } from 'lucide-react';
    import { DashboardLayout } from '@/layout/DashboardLayout';
    import { PageHeader } from '@/layout/PageHeader';
    import { Checkbox } from '@/components/ui/checkbox';

    interface Eleve {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    classe?: {
        id: number;
        nom_classe: string;
        niveau: string;
    };
    }

    interface ResponsableElevePageProps {
    responsable: {
        id: number;
        nom_complet: string;
        type_responsable: string;
    };
    eleves: Array<{
        id: number;
        matricule: string;
        nom_complet: string;
        classe?: {
        nom_classe: string;
        niveau: string;
        };
        pivot: {
        lien: string;
        lien_parental: string;
        est_responsable_financier: boolean;
        est_contact_urgence: boolean;
        est_autorise_retirer: boolean;
        ordre_priorite: number;
        telephone_urgence: string | null;
        };
    }>;
    elevesDisponibles: Eleve[];
    typesLien: Record<string, string>;
    }

    export default function ResponsableEleves({
    responsable,
    eleves,
    elevesDisponibles,
    typesLien,
    }: ResponsableElevePageProps) {
    const [search, setSearch] = useState('');
    const [selectedEleveId, setSelectedEleveId] = useState<string>('');
    const { data, setData, post, processing, errors, reset } = useForm({
        eleve_id: '',
        lien: 'tuteur_legal',
        est_responsable_financier: false,
        est_contact_urgence: false,
        est_autorise_retirer: false,
        ordre_priorite: 1,
    });

    const handleAttach = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.eleve_id) {
        alert('Veuillez sélectionner un élève');
        return;
        }

        post(`/responsables/${responsable.id}/attach-eleve`, {
        onSuccess: () => {
            reset();
            setSelectedEleveId('');
        },
        });
    };

    const handleDetach = (eleveId: number) => {
        if (confirm('Êtes-vous sûr de vouloir dissocier cet élève ?')) {
        router.delete(`/responsables/${responsable.id}/detach-eleve/${eleveId}`);
        }
    };

    const filteredElevesDisponibles = elevesDisponibles.filter(eleve =>
        eleve.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
        eleve.matricule.toLowerCase().includes(search.toLowerCase())
    );

    const getLienLabel = (lien: string) => {
        return typesLien[lien] || lien;
    };
    console.log(responsable);

    return (
        <>
        <Head title={`Gestion des élèves - ${responsable.nom_complet}`} />
        
        <DashboardLayout activeRoute="/responsables">
            <PageHeader
            title={`Gestion des élèves - ${responsable.nom_complet}`}
            description={`${eleves.length} élève(s) associé(s)`}
            breadcrumb={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Responsables', href: '/responsables' },
                { label: responsable.nom_complet, href: `/responsables/${responsable.id}` },
                { label: 'Élèves', href: `/responsables/${responsable.id}/eleves` },
            ]}
            actions={
                <Link href={`/responsables/${responsable.id}`}>
                <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour au responsable
                </Button>
                </Link>
            }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche - Ajouter un élève */}
            <div className="space-y-6">
                <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Associer un élève
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAttach} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rechercher un élève</label>
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Nom, prénom ou matricule..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sélectionner un élève *</label>
                        <Select
                        value={selectedEleveId}
                        onValueChange={(value) => {
                            setSelectedEleveId(value);
                            setData('eleve_id', value);
                        }}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un élève..." />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredElevesDisponibles.length === 0 ? (
                            <div className="py-4 text-center text-muted-foreground">
                                Aucun élève disponible
                            </div>
                            ) : (
                            filteredElevesDisponibles.map((eleve) => (
                                <SelectItem key={eleve.id} value={eleve.id.toString()}>
                                <div className="flex flex-col">
                                    <span>{eleve.nom_complet}</span>
                                    <span className="text-xs text-muted-foreground">
                                    {eleve.matricule} • {eleve.classe?.nom_classe}
                                    </span>
                                </div>
                                </SelectItem>
                            ))
                            )}
                        </SelectContent>
                        </Select>
                        {errors.eleve_id && (
                        <p className="text-sm text-destructive">{errors.eleve_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lien avec l'élève *</label>
                        <Select
                        value={data.lien}
                        onValueChange={(value) => setData('lien', value)}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir le lien..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(typesLien).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        {errors.lien && (
                        <p className="text-sm text-destructive">{errors.lien}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ordre de priorité *</label>
                        <Select
                        value={data.ordre_priorite.toString()}
                        onValueChange={(value) => setData('ordre_priorite', parseInt(value))}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Priorité..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 - Principal</SelectItem>
                            <SelectItem value="2">2 - Secondaire</SelectItem>
                            <SelectItem value="3">3 - Tertiaire</SelectItem>
                        </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                        Définit l'ordre de contact en cas de besoin
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <div className="flex items-center space-x-2">
                        <Checkbox
                            id="est_responsable_financier"
                            checked={data.est_responsable_financier}
                            onCheckedChange={(checked) => 
                            setData('est_responsable_financier', checked === true)
                            }
                        />
                        <label htmlFor="est_responsable_financier" className="text-sm cursor-pointer">
                            Responsable financier
                        </label>
                        </div>
                                            <div className="flex items-center space-x-2">
                      <Checkbox
                        id="est_contact_urgence"
                        checked={data.est_contact_urgence}
                        onCheckedChange={(checked) => 
                          setData('est_contact_urgence', checked === true)
                        }
                      />
                      <label htmlFor="est_contact_urgence" className="text-sm cursor-pointer">
                        Contact d'urgence
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="est_autorise_retirer"
                        checked={data.est_autorise_retirer}
                        onCheckedChange={(checked) => 
                          setData('est_autorise_retirer', checked === true)
                        }
                      />
                      <label htmlFor="est_autorise_retirer" className="text-sm cursor-pointer">
                        Autorisé à retirer l'élève
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={processing} className="w-full">
                      {processing ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Association en cours...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Associer l'élève
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold text-center">{eleves.length}</p>
                    <p className="text-xs text-muted-foreground text-center">Élèves associés</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold text-center">
                      {eleves.filter(e => e.pivot.est_responsable_financier).length}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">Responsables financiers</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Répartition par lien :</p>
                  <div className="space-y-1">
                    {Object.entries(
                      eleves.reduce((acc, eleve) => {
                        const lien = eleve.pivot.lien_parental;
                        acc[lien] = (acc[lien] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([lien, count]) => (
                      <div key={lien} className="flex items-center justify-between text-sm">
                        <span>{getLienLabel(lien)}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Liste des élèves associés */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Élèves associés ({eleves.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eleves.length === 0 ? (
                  <div className="text-center py-8">
                    <UserMinus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Aucun élève associé</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Utilisez le formulaire pour associer des élèves
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élève</TableHead>
                          <TableHead>Lien</TableHead>
                          <TableHead>Priorité</TableHead>
                          <TableHead>Rôles</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eleves.map((eleve) => (
                          <TableRow key={eleve.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="font-medium">{eleve.nom_complet}</div>
                                <div className="text-xs text-muted-foreground">
                                  {eleve.matricule}
                                </div>
                                {eleve.classe && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <GraduationCap className="h-3 w-3" />
                                    {eleve.classe.nom_classe} ({eleve.classe.niveau})
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getLienLabel(eleve.pivot.lien_parental)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                #{eleve.pivot.ordre_priorite}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {eleve.pivot.est_responsable_financier && (
                                  <Badge variant="default" className="text-xs">
                                    Financier
                                  </Badge>
                                )}
                                {eleve.pivot.est_contact_urgence && (
                                  <Badge variant="secondary" className="text-xs">
                                    Urgence
                                  </Badge>
                                )}
                                {eleve.pivot.est_autorise_retirer && (
                                  <Badge variant="outline" className="text-xs">
                                    Retrait
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/eleves/${eleve.id}`}>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDetach(eleve.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Unlink className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Détails des responsabilités */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Détails des responsabilités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Contacts d'urgence</p>
                      {eleves.filter(e => e.pivot.est_contact_urgence).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun contact d'urgence</p>
                      ) : (
                        <div className="space-y-2">
                          {eleves
                            .filter(e => e.pivot.est_contact_urgence)
                            .sort((a, b) => a.pivot.ordre_priorite - b.pivot.ordre_priorite)
                            .map((eleve) => (
                              <div key={eleve.id} className="flex items-center justify-between p-2 border rounded-lg">
                                <div>
                                  <p className="text-sm font-medium">{eleve.nom_complet}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Priorité #{eleve.pivot.ordre_priorite}
                                  </p>
                                </div>
                                {eleve.pivot.telephone_urgence && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {eleve.pivot.telephone_urgence}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Responsables financiers</p>
                      {eleves.filter(e => e.pivot.est_responsable_financier).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun responsable financier</p>
                      ) : (
                        <div className="space-y-2">
                          {eleves
                            .filter(e => e.pivot.est_responsable_financier)
                            .sort((a, b) => a.pivot.ordre_priorite - b.pivot.ordre_priorite)
                            .map((eleve) => (
                              <div key={eleve.id} className="p-2 border rounded-lg">
                                <p className="text-sm font-medium">{eleve.nom_complet}</p>
                                <p className="text-xs text-muted-foreground">
                                  {eleve.classe?.nom_classe} • {eleve.matricule}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
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