import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  School,
  Users,
  User,
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Edit,
  ArrowLeft,
  FileText,
  History,
  BarChart3,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  moyenne_generale: number | null;
}

interface UserLog {
  id: number;
  action: string;
  action_label: string;
  description: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  } | null;
}

interface ShowClasseProps {
  classe: {
    id: number;
    nom_classe: string;
    nom_complet: string;
    niveau: string;
    niveau_label: string;
    section: string | null;
    ref: string;
    professeur_principal: {
      id: number;
      name: string;
      email: string;
      avatar: string | null;
    } | null;
    capacite_max: number;
    nombre_eleves: number;
    pourcentage_occupation: number;
    is_full: boolean;
    statut: string;
    statut_label: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    eleves: Eleve[];
    logs: UserLog[];
  };
  stats: {
    eleves_total: number;
    eleves_garcons: number;
    eleves_filles: number;
    cours_total: number;
    moyenne_generale: number | null;
  };
}

export default function ShowClasse({ classe, stats }: ShowClasseProps) {
  const getSexeIcon = (sexe: string) => {
    return sexe === 'M' ? '👦' : '👧';
  };

  const getMoyenneColor = (moyenne: number | null) => {
    if (!moyenne) return 'text-muted-foreground';
    if (moyenne >= 15) return 'text-green-600';
    if (moyenne >= 10) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <Head title={`Classe ${classe.nom_complet}`} />
      
      <DashboardLayout activeRoute="/classes">
        <PageHeader
          title={classe.nom_complet}
          description={`Classe de ${classe.niveau_label}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/classes' },
            { label: classe.nom_complet, href: `/classes/${classe.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/classes">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/classes/${classe.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Link href={`/classes/${classe.id}/rapport`}>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Statistiques */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Occupation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Élèves</span>
                      <span className="text-sm font-bold">
                        {classe.nombre_eleves} / {classe.capacite_max}
                      </span>
                    </div>
                    <Progress value={classe.pourcentage_occupation} className="h-2" />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {classe.pourcentage_occupation}% d'occupation
                      </span>
                      {classe.is_full && (
                        <Badge variant="destructive" className="text-xs">
                          Complet
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Démographie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">Total élèves</span>
                    </div>
                    <span className="font-bold">{stats.eleves_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👦</span>
                      <span className="text-sm">Garçons</span>
                    </div>
                    <span className="font-bold">{stats.eleves_garcons}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👧</span>
                      <span className="text-sm">Filles</span>
                    </div>
                    <span className="font-bold">{stats.eleves_filles}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Moyenne classe</span>
                    </div>
                    <span className={`font-bold ${getMoyenneColor(stats.moyenne_generale)}`}>
                      {stats.moyenne_generale?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professeur principal */}
            {classe.professeur_principal && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Professeur principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {classe.professeur_principal.avatar ? (
                        <img 
                          src={classe.professeur_principal.avatar} 
                          alt={classe.professeur_principal.name}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {classe.professeur_principal.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{classe.professeur_principal.name}</p>
                      <p className="text-sm text-muted-foreground">{classe.professeur_principal.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informations principales et onglets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="eleves" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="eleves" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Élèves ({classe.eleves.length})
                </TabsTrigger>
                <TabsTrigger value="informations" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Informations
                </TabsTrigger>
                <TabsTrigger value="activite" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Activité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="eleves" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6">
                    {classe.eleves.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Aucun élève dans cette classe</p>
                        <p className="text-sm mt-2">Ajoutez des élèves pour commencer</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Élève</th>
                              <th className="text-left py-3 px-4">Sexe</th>
                              <th className="text-left py-3 px-4">Date de naissance</th>
                              <th className="text-left py-3 px-4">Moyenne</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classe.eleves.map((eleve) => (
                              <tr key={eleve.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-sm font-bold">
                                        {eleve.nom.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {eleve.nom} {eleve.prenom}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-2xl">
                                    {getSexeIcon(eleve.sexe)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {formatDate(eleve.date_naissance)}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`font-bold ${getMoyenneColor(eleve.moyenne_generale)}`}>
                                    {eleve.moyenne_generale?.toFixed(2) || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="informations" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Informations générales
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Nom complet</p>
                            <p className="font-medium">{classe.nom_complet}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Niveau</p>
                            <Badge variant={classe.niveau === 'primaire' ? 'default' : 'secondary'}>
                              {classe.niveau_label}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Statut</p>
                            <Badge variant={
                              classe.statut === 'active' ? 'success' :
                              classe.statut === 'inactive' ? 'warning' : 'secondary'
                            }>
                              {classe.statut_label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Détails techniques
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Référence</p>
                            <p className="font-medium font-mono">{classe.ref}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date de création</p>
                            <p className="font-medium">{formatDate(classe.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                            <p className="font-medium">{formatDate(classe.updated_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {classe.description && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Description
                        </h3>
                        <p className="text-sm bg-muted/50 p-4 rounded-lg">
                          {classe.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activite" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="p-6">
                    {classe.logs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Aucune activité enregistrée</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {classe.logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <History className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  {log.user?.name || 'Système'}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.description}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {log.action_label}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}