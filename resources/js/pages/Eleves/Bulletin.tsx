import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Download,
  Printer,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  GraduationCap,
  Calendar,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface Matiere {
  matiere: string;
  coefficient: number;
  notes: Array<{
    valeur: number;
    type: string;
    date: string;
  }>;
  moyenne: number;
}

interface BulletinProps {
  eleve: {
    id: number;
    nom_complet: string;
    matricule: string;
    classe: {
      id: number;
      nom_classe: string;
      niveau: string;
      section: string | null;
    };
    date_naissance: string;
    sexe: string;
    photo_url: string;
  };
  matieres: Record<string, Matiere>;
  moyenne_generale: number | null;
  date_edition: string;
}

export default function Bulletin({ eleve, matieres, moyenne_generale, date_edition }: BulletinProps) {
  const handlePrint = () => {
    window.print();
  };

  const getAppreciation = (moyenne: number) => {
    if (moyenne >= 16) return { text: 'Excellent', color: 'text-green-700', bg: 'bg-green-100' };
    if (moyenne >= 14) return { text: 'Très Bien', color: 'text-green-600', bg: 'bg-green-50' };
    if (moyenne >= 12) return { text: 'Bien', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (moyenne >= 10) return { text: 'Assez Bien', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (moyenne >= 8) return { text: 'Passable', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (moyenne >= 6) return { text: 'Insuffisant', color: 'text-red-600', bg: 'bg-red-50' };
    return { text: 'Très Faible', color: 'text-red-700', bg: 'bg-red-100' };
  };

  const getTrendIcon = (moyenne: number) => {
    if (moyenne >= 10) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (moyenne >= 8) return <Minus className="h-4 w-4 text-amber-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const calculateTotalCoefficient = () => {
    return Object.values(matieres).reduce((total, matiere) => total + matiere.coefficient, 0);
  };

  return (
    <>
      <Head title={`Bulletin - ${eleve.nom_complet}`} />
      
      <DashboardLayout activeRoute="/eleves">
        <PageHeader
          title="Bulletin scolaire"
          description={`${eleve.nom_complet} - ${eleve.classe.nom_classe}`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Élèves', href: '/eleves' },
            { label: 'Bulletin', href: `/eleves/${eleve.id}/bulletin` },
          ]}
          actions={
            <div className="flex items-center gap-2 print:hidden">
              <Link href={`/eleves/${eleve.id}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          }
        />

        <div className="max-w-6xl mx-auto">
          {/* Bulletin principal - Version imprimable */}
          <Card className="print:shadow-none print:border-2">
            <CardContent className="p-8">
              {/* En-tête de l'établissement */}
              <div className="text-center mb-8 border-b pb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">ÉTABLISSEMENT SCOLAIRE</h1>
                    <p className="text-muted-foreground">Ministère de l'Éducation Nationale</p>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-primary">BULLETIN DE NOTES</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Année scolaire {new Date().getFullYear() - 1}/{new Date().getFullYear()}
                </p>
              </div>

              {/* Informations de l'élève */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2">
                      <AvatarImage src={eleve.photo_url} alt={eleve.nom_complet} />
                      <AvatarFallback className="text-lg">
                        {eleve.nom_complet.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{eleve.nom_complet}</h3>
                      <p className="text-sm text-muted-foreground">Matricule: {eleve.matricule}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Classe:</span>
                    <span className="font-bold">{eleve.classe.nom_classe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Niveau:</span>
                    <Badge variant="outline">{eleve.classe.niveau}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date de naissance:</span>
                    <span>{new Date(eleve.date_naissance).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Sexe:</span>
                    <span>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date d'édition:</span>
                    <span>{date_edition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total coefficients:</span>
                    <span className="font-bold">{calculateTotalCoefficient()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Nombre de matières:</span>
                    <span className="font-bold">{Object.keys(matieres).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Moyenne générale:</span>
                    <span className={`text-lg font-bold ${moyenne_generale ? getAppreciation(moyenne_generale).color : ''}`}>
                      {moyenne_generale ? moyenne_generale.toFixed(2) : 'N/A'} / 20
                    </span>
                  </div>
                </div>
              </div>

              {/* Tableau des notes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Détail des notes par matière
                </h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Matière</TableHead>
                        <TableHead className="text-center">Coefficient</TableHead>
                        <TableHead className="text-center">Notes</TableHead>
                        <TableHead className="text-center">Moyenne</TableHead>
                        <TableHead className="text-center">Appréciation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(matieres).map(([matiereId, matiere], index) => {
                        const appreciation = getAppreciation(matiere.moyenne);
                        return (
                          <TableRow key={matiereId}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium">{matiere.matiere}</div>
                              {matiere.notes.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {matiere.notes.length} note(s)
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{matiere.coefficient}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 justify-center">
                                {matiere.notes.map((note, noteIndex) => (
                                  <div
                                    key={noteIndex}
                                    className="px-2 py-1 bg-muted rounded text-xs"
                                    title={`${note.type} - ${new Date(note.date).toLocaleDateString('fr-FR')}`}
                                  >
                                    {note.valeur.toFixed(1)}
                                  </div>
                                ))}
                                {matiere.notes.length === 0 && (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`font-bold ${appreciation.color}`}>
                                  {matiere.moyenne.toFixed(2)}
                                </span>
                                {getTrendIcon(matiere.moyenne)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={appreciation.bg + ' ' + appreciation.color}>
                                {appreciation.text}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Résumé et appréciation générale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Résumé académique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Moyenne générale:</span>
                        {moyenne_generale ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${getAppreciation(moyenne_generale).color}`}>
                              {moyenne_generale.toFixed(2)} / 20
                            </span>
                            {getTrendIcon(moyenne_generale)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non calculée</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Appréciation générale:</span>
                        {moyenne_generale ? (
                          <Badge variant="outline" className={`text-sm ${getAppreciation(moyenne_generale).bg} ${getAppreciation(moyenne_generale).color}`}>
                            {getAppreciation(moyenne_generale).text}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Total des coefficients:</span>
                        <span className="font-bold">{calculateTotalCoefficient()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Nombre de matières:</span>
                        <span className="font-bold">{Object.keys(matieres).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Observations et signatures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="h-24 border rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Observations du professeur principal:</p>
                        <div className="h-16"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="border-t pt-2">
                            <p className="text-xs text-muted-foreground">Le Professeur Principal</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="border-t pt-2">
                            <p className="text-xs text-muted-foreground">Le Chef d'Établissement</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="border-t pt-2">
                          <p className="text-xs text-muted-foreground">Cachet de l'établissement</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Légende et informations */}
              <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium mb-1">Légende:</p>
                    <p>≥ 16: Excellent | ≥ 14: Très Bien | ≥ 12: Bien</p>
                    <p>≥ 10: Assez Bien | ≥ 8: Passable | ≥ 6: Insuffisant</p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Informations:</p>
                    <p>Ce bulletin est établi par ordinateur.</p>
                    <p>Toute altération rend le document nul.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Contact:</p>
                    <p>Établissement Scolaire</p>
                    <p>Tél: 33 123 45 67 | Email: contact@etablissement.edu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes d'impression */}
          <div className="print:hidden mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Printer className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Instructions pour l'impression</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliquez sur "Imprimer" pour générer une version imprimable du bulletin.
                      Pour de meilleurs résultats, utilisez l'orientation "Paysage".
                    </p>
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