<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Journal de Caisse</title>
    <style>
        @page {
            margin: 20mm;
            size: A4 portrait;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px double #1a237e;
            padding-bottom: 15px;
        }
        
        .school-name {
            font-size: 18pt;
            font-weight: bold;
            color: #1a237e;
            margin-bottom: 5px;
        }
        
        .school-details {
            font-size: 9pt;
            color: #666;
        }
        
        .title {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
        }
        
        .period {
            text-align: center;
            font-size: 11pt;
            margin-bottom: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        th {
            background-color: #1a237e;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
        }
        
        td {
            padding: 6px;
            border: 1px solid #ddd;
            vertical-align: top;
        }
        
        .entree {
            background-color: #e8f5e9;
        }
        
        .sortie {
            background-color: #ffebee;
        }
        
        .montant {
            text-align: right;
            font-weight: bold;
        }
        
        .entree .montant {
            color: #2e7d32;
        }
        
        .sortie .montant {
            color: #c62828;
        }
        
        .stats {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px solid #eee;
        }
        
        
        
        .stat-value {
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-data {
            text-align: center;
            padding: 30px;
            color: #999;
            font-style: italic;
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <div class="school-name">{{ $entete['nom_ecole'] ?? 'École Excellence' }}</div>
        <div class="school-details">
            {{ $entete['adresse'] ?? 'Adresse non spécifiée' }}<br>
            Tél: {{ $entete['telephone'] ?? 'Non spécifié' }} | Email: {{ $entete['email'] ?? 'Non spécifié' }}
        </div>
    </div>

    <!-- Titre -->
    <div class="title">JOURNAL DE CAISSE</div>
    
    <!-- Période -->
    <div class="period">
        Période du {{ $date_debut }} au {{ $date_fin }}
        @if($search)
        <br><small>Filtre de recherche: "{{ $search }}"</small>
        @endif
    </div>

    <!-- Tableau des mouvements -->
    @if(count($mouvements) > 0)
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Mode Paiement</th>
                    <th>Montant</th>
                </tr>
            </thead>
            <tbody>
                @foreach($mouvements as $mouvement)
                    <tr class="{{ strtolower($mouvement['type']) }}">
                        <td>{{ \Carbon\Carbon::parse($mouvement['date'])->format('d/m/Y') }}</td>
                        <td>{{ $mouvement['type'] }}</td>
                        <td>{{ $mouvement['description'] ?? '' }}</td>
                        
                        <td>{{ $mouvement['mode_paiement'] }}</td>
                        <td class="montant">
                            {{ number_format($mouvement['montant'], 2, ',', ' ') }} $
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            Aucun mouvement trouvé pour la période sélectionnée
        </div>
    @endif

    <!-- Statistiques -->
    <div class="stats">
        <h3 style="margin-top: 0; ">RÉSUMÉ STATISTIQUE</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Total Entrées:</span>
                <span class="stat-value" style="color: #2e7d32;">
                    {{ number_format($stats['total_entrees'], 2, ',', ' ') }} $
                </span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Sorties:</span>
                <span class="stat-value" style="color: #c62828;">
                    {{ number_format($stats['total_sorties'], 2, ',', ' ') }} $
                </span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Nombre Entrées:</span>
                <span class="stat-value">{{ $stats['nombre_entrees'] }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Nombre Sorties:</span>
                <span class="stat-value">{{ $stats['nombre_sorties'] }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Solde Initial:</span>
                <span class="stat-value">
                    {{ number_format($stats['solde_initial'], 2, ',', ' ') }} $
                </span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Solde Final:</span>
                <span class="stat-value" style="font-weight: bold;">
                    {{ number_format($stats['solde_final'], 2, ',', ' ') }} $
                </span>
            </div>
        </div>
    </div>


    <!-- Pied de page -->
    <div class="footer">
        Document généré le {{ $date_export }}<br>
        {{ $entete['nom_ecole'] ?? 'École Excellence' }} - Système de Gestion de Caisse<br>
        Page 1 sur 1
    </div>
</body>
</html>