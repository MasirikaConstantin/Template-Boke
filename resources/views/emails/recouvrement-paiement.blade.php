<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rappel de paiement</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px">

<div style="max-width:600px; margin:auto; background:#ffffff; padding:20px; border-radius:6px">

    <h2 style="color:#c0392b">🔔 Rappel de paiement</h2>

    <p>Bonjour,</p>

    <p>
        Nous vous rappelons qu’un solde reste à payer pour la scolarité de l’élève :
    </p>

    <ul>
        <li><strong>Nom de l’élève :</strong> {{ $eleve->nom_complet }}</li>
        <li><strong>Classe :</strong> {{ $eleve->classe->nom_classe ?? '-' }}</li>
        <li><strong>Tranche concernée :</strong> {{ $tranche->nom_tranche }}</li>
        <li><strong>Tranche Écheance :</strong> {{ \Carbon\Carbon::parse($tranche->date_limite)->format('d/m/Y') }}</li>
    </ul>

    <hr>

    <ul>
        <li><strong>Montant total de la tranche :</strong>
            {{ number_format($tranche->montant, 0, ',', ' ') }} $
        </li>
        <li><strong>Total déjà payé :</strong>
            {{ number_format($totalPaye, 0, ',', ' ') }} $
        </li>
        <li>
            <strong style="color:#c0392b">
                Reste à payer :
                {{ number_format($resteAPayer, 0, ',', ' ') }} $
            </strong>
        </li>
    </ul>

    <p style="margin-top:15px">
        Nous vous prions de bien vouloir régulariser ce paiement dans les meilleurs délais.
    </p>

    <p>
        Pour toute information complémentaire, veuillez contacter l’administration de l’établissement.
    </p>

    <br>

    <p style="font-size:12px; color:#777">
        Ceci est un message automatique de recouvrement. Merci de ne pas y répondre directement.
    </p>

</div>

</body>
</html>
