<?php

namespace App\Mail;

use App\Models\Paiement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaiementEffectueMail extends Mailable
{
    use Queueable, SerializesModels;

    public Paiement $paiement;
    public float $totalPaye;
    public float $resteAPayer;

    public function __construct(Paiement $paiement, float $totalPaye, float $resteAPayer)
    {
        $this->paiement = $paiement;
        $this->totalPaye = $totalPaye;
        $this->resteAPayer = $resteAPayer;
    }

    public function build()
    {
        return $this->subject('Confirmation de paiement – ' . $this->paiement->eleve->nom_complet)
            ->view('emails.paiement-effectue');
    }
}
