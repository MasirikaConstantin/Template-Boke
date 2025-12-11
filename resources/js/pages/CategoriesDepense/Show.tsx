import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Folder,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  FileText,
  Plus,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CategorieDepenseShowProps {
  auth: any;
  categorie: {
    id: number;
    nom_categorie: string;
    code: string;
    description: string | null;
    est_actif: boolean;
    ref: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  stats?: {
    total_depenses: number;
    montant_total: number;
    derniere_depense: string | null;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function CategorieDepenseShow({ auth, categorie, stats, flash }: CategorieDepenseShowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head title={`Catégorie: ${categorie.nom_categorie}`} />
      
      <DashboardLayout activeRoute="/budgets">
        <PageHeader
          title={categorie.nom_categorie}
          description={`Catégorie de dépense - ${categorie.code}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Budgets', href: '/budgets' },
            { label: 'Catégories', href: '/categories-depense' },
            { label: categorie.nom_categorie, href: '#' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/categories-depense">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={`/categories-depense/${categorie.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  Informations de la catégorie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>Code</span>
                    </div>
                    <div className="font-medium text-lg">
                      <code className="bg-muted px-3 py-1.5 rounded text-base">
                        {categorie.code}
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Statut</span>
                    </div>
                    <div>
                      <Badge variant={categorie.est_actif ? "default" : "secondary"}>
                        {categorie.est_actif ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactif
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {categorie.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Description</span>
                      </div>
                      <div className="text-foreground whitespace-pre-wrap">
                        {categorie.description}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Créée le</span>
                    </div>
                    <div className="font-medium">
                      {formatDate(categorie.created_at)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Modifiée le</span>
                    </div>
                    <div className="font-medium">
                      {formatDate(categorie.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Référence
                  </div>
                  <div className="font-mono text-sm">
                    {categorie.ref}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques d'utilisation</CardTitle>
                  <CardDescription>
                    Données d'utilisation de cette catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {stats.total_depenses || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dépenses totales
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.montant_total ? new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(stats.montant_total).replace('$US', '$') : '$0'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Montant total
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-lg font-semibold">
                        {stats.derniere_depense ? formatDate(stats.derniere_depense) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dernière dépense
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions rapides et informations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 gap-2">
                <Link href={`/depenses?categorie_id=${categorie.id}`} className="w-full mb-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Voir les dépenses
                  </Button>
                </Link>
                <Link href={`/depenses/create?categorie_id=${categorie.id}`} className="w-full mt-6">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle dépense
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    La suppression est irréversible. Les dépenses existantes conserveront cette catégorie.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                        router.delete(`/categories-depense/${categorie.id}`);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer la catégorie
                  </Button>
                </div>
              </CardContent>
            </Card>

            {categorie.deleted_at && (
              <Card className="border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-amber-600">Catégorie supprimée</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cette catégorie a été supprimée le {formatDate(categorie.deleted_at)}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-amber-600 border-amber-500"
                    onClick={() => {
                      if (confirm('Restaurer cette catégorie ?')) {
                        router.put(`/categories-depense/${categorie.id}/restore`);
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}