<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class RecouvrementExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, WithTitle, ShouldAutoSize, WithEvents, WithCustomStartCell
{
    protected $dettes;
    protected $tranche;
    protected $stats;
    protected $dateGeneration;

    public function __construct($dettes, $tranche, $stats)
    {
        $this->dettes = $dettes;
        $this->tranche = $tranche;
        $this->stats = $stats;
        $this->dateGeneration = now()->format('d/m/Y H:i');
    }

    public function collection()
    {
        $data = $this->dettes->map(function ($dette, $index) {
            return [
                $index + 1, // N°
                $dette['ref'] ?? '',
                $dette['nom_complet'] ?? ($dette['nom'] . ' ' . $dette['prenom']),
                $dette['classe'] ?? '',
                $dette['montant_total'] ?? 0,
                $dette['montant_paye'] ?? 0,
                $dette['reste_a_payer'] ?? 0,
                round($dette['pourcentage_paye'] ?? 0, 1) . '%',
                $dette['statut_label'] ?? $this->getStatutLabel($dette),
                $dette['date_dernier_paiement'] ? \Carbon\Carbon::parse($dette['date_dernier_paiement'])->format('d/m/Y') : 'Aucun',
            ];
        });

        return $data;
    }

    public function headings(): array
    {
        return [
            'N°',
            'Référence',
            'Nom',
            'Classe',
            'Montant total',
            'Montant payé',
            'Reste à payer',
            '% Payé',
            'Statut',
            'Dernier paiement',
        ];
    }

    public function startCell(): string
    {
        return 'A4'; // Les données commencent à la ligne 4 (après les titres)
    }

    public function styles(Worksheet $sheet)
    {
        // Titre du rapport (ligne 1)
        $sheet->mergeCells('A1:J1');
        $sheet->setCellValue('A1', 'RAPPORT DE RECOUVREMENT - ' . strtoupper($this->tranche->nom_tranche));
        $sheet->getRowDimension(1)->setRowHeight(30);
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 14,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '3B82F6'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Informations de la tranche (ligne 2)
        $sheet->mergeCells('A2:J2');
        $sheet->setCellValue('A2', 
            'Configuration: ' . ($this->tranche->configuration_frais->nom_frais ?? 'N/A') . 
            ' | Date limite: ' . \Carbon\Carbon::parse($this->tranche->date_limite)->format('d/m/Y') . 
            ' | Montant: ' . number_format($this->tranche->montant, 0, ',', ' ') . ' CDF'
        );
        $sheet->getStyle('A2')->applyFromArray([
            'font' => [
                'italic' => true,
                'size' => 10,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        // En-têtes du tableau (ligne 3)
        $headerRow = 3;
        $sheet->getStyle("A{$headerRow}:J{$headerRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => '1E40AF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'EFF6FF'],
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '93C5FD'],
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Hauteur des lignes d'en-tête
        $sheet->getRowDimension($headerRow)->setRowHeight(25);

        // Les données commencent à la ligne 4 (défini par startCell())
        $dataStartRow = 4;
        $totalRows = $dataStartRow + count($this->dettes);
        
        // Style des données
        $dataRange = "A{$dataStartRow}:J" . ($totalRows - 1);
        $sheet->getStyle($dataRange)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E7EB'],
                ],
            ],
        ]);

        // Style des lignes alternées
        for ($i = $dataStartRow; $i < $totalRows; $i++) {
            if (($i - $dataStartRow) % 2 == 0) {
                $sheet->getStyle("A{$i}:J{$i}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('F8FAFC');
            }
        }

        // Style des montants (colonnes E, F, G)
        $montantRange = "E{$dataStartRow}:G" . $totalRows;
        $sheet->getStyle($montantRange)
            ->getNumberFormat()
            ->setFormatCode('#,##0 "CDF"');

        // Alignement des montants
        $sheet->getStyle("E{$dataStartRow}:G{$totalRows}")
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Alignement centré pour certaines colonnes
        $sheet->getStyle("A{$dataStartRow}:A{$totalRows}") // N°
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        $sheet->getStyle("I{$dataStartRow}:J{$totalRows}") // Statut et Dernier paiement
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Ligne des totaux
        $totalRow = $totalRows;
        $sheet->setCellValue("A{$totalRow}", 'TOTAL');
        $sheet->setCellValue("E{$totalRow}", $this->stats['total_dette']);
        $sheet->setCellValue("F{$totalRow}", $this->stats['total_paye']);
        $sheet->setCellValue("G{$totalRow}", $this->stats['total_reste']);
        $sheet->setCellValue("H{$totalRow}", round($this->stats['taux_recouvrement'], 1) . '%');
        
        $sheet->getStyle("A{$totalRow}:J{$totalRow}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FEF3C7'],
            ],
            'borders' => [
                'top' => [
                    'borderStyle' => Border::BORDER_DOUBLE,
                    'color' => ['rgb' => 'D97706'],
                ],
                'bottom' => [
                    'borderStyle' => Border::BORDER_DOUBLE,
                    'color' => ['rgb' => 'D97706'],
                ],
            ],
        ]);

        // Statistiques en bas
        $footerRow = $totalRow + 2;
        $sheet->setCellValue("A{$footerRow}", 'Statistiques du rapport:');
        $sheet->mergeCells("A{$footerRow}:B{$footerRow}");
        
        $sheet->setCellValue("C{$footerRow}", 'Nombre d\'élèves:');
        $sheet->setCellValue("D{$footerRow}", $this->stats['total_eleves']);
        
        $sheet->setCellValue("E{$footerRow}", 'Total payé:');
        $sheet->setCellValue("F{$footerRow}", number_format($this->stats['total_paye'], 0, ',', ' ') . ' CDF');
        
        $sheet->setCellValue("G{$footerRow}", 'Taux recouvrement:');
        $sheet->setCellValue("H{$footerRow}", round($this->stats['taux_recouvrement'], 1) . '%');
        
        $sheet->setCellValue("I{$footerRow}", 'Généré le:');
        $sheet->setCellValue("J{$footerRow}", $this->dateGeneration);

        // Style du footer
        $sheet->getStyle("A{$footerRow}:J{$footerRow}")->getFont()->setSize(10);
        $sheet->getStyle("C{$footerRow}:D{$footerRow}")->getFont()->setBold(true);
        $sheet->getStyle("E{$footerRow}:F{$footerRow}")->getFont()->setBold(true);
        $sheet->getStyle("G{$footerRow}:H{$footerRow}")->getFont()->setBold(true);
        $sheet->getStyle("I{$footerRow}:J{$footerRow}")->getFont()->setBold(true);

        return $sheet;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,   // N°
            'B' => 15,  // Référence
            'C' => 30,  // Nom
            'D' => 20,  // Classe
            'E' => 15,  // Montant total
            'F' => 15,  // Montant payé
            'G' => 15,  // Reste à payer
            'H' => 12,  // % Payé
            'I' => 15,  // Statut
            'J' => 18,  // Dernier paiement
        ];
    }

    public function title(): string
    {
        return 'Recouvrement ' . substr($this->tranche->nom_tranche, 0, 25);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // S'assurer que les en-têtes sont écrits à la bonne ligne
                $headers = $this->headings();
                $headerRow = 3; // Ligne 3 pour les en-têtes
                
                foreach ($headers as $colIndex => $header) {
                    $column = chr(65 + $colIndex); // Convertir 0->A, 1->B, etc.
                    $sheet->setCellValue("{$column}{$headerRow}", $header);
                }
            },
        ];
    }

    private function getStatutLabel($dette): string
    {
        if (isset($dette['est_regle']) && $dette['est_regle']) {
            return 'Réglé';
        }

        if (isset($dette['jours_restants'])) {
            if ($dette['jours_restants'] < 0) {
                return 'En retard';
            } elseif ($dette['jours_restants'] <= 7) {
                return 'Urgent';
            }
        }

        return 'En cours';
    }
}