<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class CaisseExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, WithColumnWidths, WithEvents
{
    protected $mouvements;
    protected $stats;
    protected $dateDebut;
    protected $dateFin;

    public function __construct($mouvements, $stats, $dateDebut, $dateFin)
    {
        $this->mouvements = $mouvements;
        $this->stats = $stats;
        $this->dateDebut = $dateDebut;
        $this->dateFin = $dateFin;
    }

    public function collection()
    {
        return collect($this->mouvements);
    }

    public function headings(): array
    {
        return [
            'JOURNAL DE CAISSE',
            'Période du ' . \Carbon\Carbon::parse($this->dateDebut)->format('d/m/Y') . 
            ' au ' . \Carbon\Carbon::parse($this->dateFin)->format('d/m/Y'),
            '', // Ligne vide
            ['Date', 'Heure', 'Type', 'Référence', 'Description', 'Élève/Bénéficiaire', 
             'Catégorie/Tranche', 'Mode Paiement', 'Montant', 'Utilisateur', 'Commentaire']
        ];
    }

    public function map($mouvement): array
    {
        return [
            \Carbon\Carbon::parse($mouvement['date'])->format('d/m/Y'),
            $mouvement['heure'] ?? '',
            $mouvement['type'],
            $mouvement['reference'],
            $mouvement['description'] ?? '',
            $mouvement['type'] === 'Entrée' ? ($mouvement['eleve'] ?? '') : ($mouvement['beneficiaire'] ?? ''),
            $mouvement['type'] === 'Entrée' ? ($mouvement['tranche'] ?? '') : ($mouvement['categorie'] ?? ''),
            $mouvement['mode_paiement'],
            $mouvement['montant'],
            $mouvement['utilisateur'],
            $mouvement['commentaire'] ?? '',
        ];
    }

    public function title(): string
    {
        return 'Journal de caisse';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 12, // Date
            'B' => 8,  // Heure
            'C' => 10, // Type
            'D' => 15, // Référence
            'E' => 25, // Description
            'F' => 25, // Élève/Bénéficiaire
            'G' => 20, // Catégorie/Tranche
            'H' => 15, // Mode Paiement
            'I' => 15, // Montant
            'J' => 20, // Utilisateur
            'K' => 30, // Commentaire
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Titre principal
        $sheet->mergeCells('A1:K1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => '1a237e'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        // Sous-titre
        $sheet->mergeCells('A2:K2');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        // En-têtes du tableau
        $sheet->getStyle('A4:K4')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1a237e'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Bordures pour toutes les données
        $lastRow = count($this->mouvements) + 4;
        $sheet->getStyle("A4:K{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Style pour les montants
        $sheet->getStyle("I5:I{$lastRow}")->applyFromArray([
            'numberFormat' => [
                'formatCode' => '#,##0.00 "FCFA"',
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
            ],
        ]);

        // Alternance des couleurs
        for ($row = 5; $row <= $lastRow; $row++) {
            $type = $sheet->getCell("C{$row}")->getValue();
            $color = $type === 'Entrée' ? 'E8F5E9' : 'FFEBEE'; // Vert clair pour entrées, rouge clair pour sorties
            
            $sheet->getStyle("A{$row}:K{$row}")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $color],
                ],
            ]);
        }

        // Ajouter les statistiques
        $statsRow = $lastRow + 2;
        
        $sheet->setCellValue("A{$statsRow}", 'RÉSUMÉ DES STATISTIQUES');
        $sheet->mergeCells("A{$statsRow}:K{$statsRow}");
        $sheet->getStyle("A{$statsRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => '1a237e'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        $statsRow++;
        $sheet->setCellValue("A{$statsRow}", 'Total Entrées:');
        $sheet->setCellValue("B{$statsRow}", $this->stats['total_entrees']);
        $sheet->getStyle("B{$statsRow}")->getNumberFormat()->setFormatCode('#,##0.00 "FCFA"');
        $sheet->getStyle("B{$statsRow}")->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF00FF00'));

        $statsRow++;
        $sheet->setCellValue("A{$statsRow}", 'Total Sorties:');
        $sheet->setCellValue("B{$statsRow}", $this->stats['total_sorties']);
        $sheet->getStyle("B{$statsRow}")->getNumberFormat()->setFormatCode('#,##0.00 "FCFA"');
        $sheet->getStyle("B{$statsRow}")->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFF0000'));

        $statsRow++;
        $sheet->setCellValue("A{$statsRow}", 'Solde Final:');
        $sheet->setCellValue("B{$statsRow}", $this->stats['solde_final']);
        $sheet->getStyle("B{$statsRow}")->getNumberFormat()->setFormatCode('#,##0.00 "FCFA"');
        $sheet->getStyle("B{$statsRow}")->getFont()->setBold(true);

        $statsRow++;
        $sheet->setCellValue("A{$statsRow}", 'Nombre d\'opérations:');
        $sheet->setCellValue("B{$statsRow}", $this->stats['total_operations']);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // Auto-fit les colonnes
                foreach (range('A', 'K') as $column) {
                    $event->sheet->getColumnDimension($column)->setAutoSize(true);
                }
            },
        ];
    }
}